import { describe, it, expect, vi, beforeEach } from 'vitest';
import { funcionarioService } from '../../../lib/services/funcionarioService';
import { supabase } from '../../../lib/supabase';

// Mock Auth Client from the same file but it's an internal variable
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

    describe('deleteFuncionario', () => {
        it('debe eliminar la ficha y el Auth (happy path)', async () => {
            const funcFetchMock = vi.fn().mockResolvedValue({ data: { profile_id: 'prof-1' }, error: null });
            const deleteMock = vi.fn().mockResolvedValue({ error: null });
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
                                then: (cb: any) => cb({ error: null }) // simulate promise resolution for delete
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
                    eq: vi.fn().mockImplementation((col, val) => {
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
