import { describe, it, expect, vi, beforeEach } from 'vitest';
import { funcionarioService } from '../../../lib/services/funcionarioService';
import { supabase } from '../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        signUp: vi.fn()
      }
    })
  };
});

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('funcionarioService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getFuncionarios', () => {
        it('debe retornar lista de funcionarios (happy path)', async () => {
            const mockData = [{ id: '1', cedula: '123' }];
            const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            const result = await funcionarioService.getFuncionarios();
            expect(result).toEqual(mockData);
        });

        it('debe lanzar error de base de datos', async () => {
            const orderMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: orderMock,
            } as never);

            await expect(funcionarioService.getFuncionarios()).rejects.toThrow('DB Error');
        });
    });

    describe('createFuncionario', () => {
        const formData = {
            cedula: '12345678',
            nombre: 'Juan',
            apellido: 'Perez',
            email: 'juan@test.com',
            cargo: 'Limpieza',
            departamento_id: 'd1',
            fecha_ingreso: '2026-01-01',
            tipo_contrato: 'Prueba',
            estado: 'activo'
        };

        it('debe ejecutar rollback (delete_auth_user) si falla la inserción luego de crear Auth', async () => {
            // 1. Simular creación de Auth exitosa
            const { auth } = vi.mocked(createClient)('','');
            vi.mocked(auth.signUp).mockResolvedValue({
                data: { user: { id: 'auth-user-id', identities: [{}] } },
                error: null
            } as never);

            // 2. Simular que no existe profile
            const profileMock = vi.fn().mockResolvedValue({ data: null, error: null });
            
            // 3. Simular que el Upsert a profile funciona (o también podríamos simular fallo acá)
            const profileUpsertMock = vi.fn().mockResolvedValue({ error: null });

            // 4. Simular que falla la creación final del funcionario
            const funcInsertMock = vi.fn().mockResolvedValue({ error: { message: 'Falla al crear ficha del empleado' } });
            
            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'profiles') {
                    return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: profileMock, upsert: profileUpsertMock } as never;
                }
                if (table === 'funcionarios') {
                    return { insert: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: funcInsertMock } as never;
                }
                return {} as never;
            });

            const rpcMock = vi.fn().mockResolvedValue({ error: null });
            vi.mocked(supabase.rpc).mockImplementation(rpcMock as never);

            await expect(funcionarioService.createFuncionario(formData as never)).rejects.toThrow(
                'Fallo en la creación del funcionario: Falla al crear ficha del empleado'
            );

            // Confirmar que el "rollback" sintético fue ejecutado en el catch block
            expect(supabase.rpc).toHaveBeenCalledWith('delete_auth_user', { target_user_id: 'auth-user-id' });
        });

        it('debe crear un funcionario correctamente (happy path)', async () => {
            const { auth } = vi.mocked(createClient)('','');
            vi.mocked(auth.signUp).mockResolvedValue({
                data: { user: { id: 'auth-user-id', identities: [{}] } },
                error: null
            } as never);

            vi.mocked(supabase.from).mockImplementation((table) => {
                if (table === 'profiles') {
                    return { 
                        select: vi.fn().mockReturnThis(), 
                        eq: vi.fn().mockReturnThis(), 
                        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
                        upsert: vi.fn().mockResolvedValue({ error: null })
                    } as never;
                }
                if (table === 'funcionarios') {
                    return { 
                        insert: vi.fn().mockReturnThis(), 
                        select: vi.fn().mockReturnThis(), 
                        single: vi.fn().mockResolvedValue({ data: { id: 'f-1', profile_id: 'auth-user-id' }, error: null }) 
                    } as never;
                }
                return {} as never;
            });

            const result = await funcionarioService.createFuncionario(formData as never);
            expect(result).toEqual({ id: 'f-1', profile_id: 'auth-user-id' });
        });
    });

    describe('deleteFuncionario', () => {
        it('debe eliminar la ficha y el Auth (happy path)', async () => {
            const funcFetchMock = vi.fn().mockResolvedValue({ data: { profile_id: 'prof-1' }, error: null });
            const rpcMock = vi.fn().mockResolvedValue({ error: null });

            vi.mocked(supabase.from).mockImplementation(() => {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: funcFetchMock,
                    delete: vi.fn().mockReturnThis(),
                    // the sequence applies eq later implicitly in our mock
                } as never;
            });
            // Specific overrides
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: funcFetchMock,
                delete: vi.fn().mockReturnThis()
            } as never);
            
            // Re-mock to handle sequence
            vi.mocked(supabase.from).mockImplementation((table) => {
                const chain = {
                    select: vi.fn().mockReturnThis(),
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockImplementation(() => {
                        if (table === 'funcionarios') {
                            return {
                                single: funcFetchMock, // for select
                                // For delete there's no single
                                then: (cb: (val: { error: unknown }) => void) => cb({ error: null }) // simulate promise resolution for delete
                            }
                        }
                        return chain;
                    }),
                    single: funcFetchMock
                };
                return chain as never;
            });

            vi.mocked(supabase.rpc).mockImplementation(rpcMock as never);

            // Redefine delete mock cleanly
            const singleMockFn = vi.fn().mockResolvedValue({ data: { profile_id: 'prof-1' }, error: null });
            const eqDeleteMockFn = vi.fn().mockResolvedValue({ error: null });
            vi.mocked(supabase.from).mockImplementation(() => {
                return {
                    select: vi.fn().mockReturnThis(),
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockImplementation(() => {
                        return { single: singleMockFn, then: eqDeleteMockFn().then.bind(eqDeleteMockFn()) }; 
                    }) as never
                } as never;
            });

            // Re-simplify
            vi.mocked(supabase.from).mockImplementation(() => ({
                select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { profile_id: 'prof-1' }, error: null }) }) }),
                delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
            }) as never);

            const result = await funcionarioService.deleteFuncionario('1');
            expect(result).toBe(true);
            expect(supabase.rpc).toHaveBeenCalledWith('delete_auth_user', { target_user_id: 'prof-1' });
        });
    });
});
