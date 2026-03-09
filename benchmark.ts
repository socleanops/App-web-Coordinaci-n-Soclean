import { performance } from 'perf_hooks';

const mockCreateFuncionario = async (id: number) => {
    return new Promise(resolve => setTimeout(resolve, 50));
};

const runSequential = async (data: number[]) => {
    for (let i = 0; i < data.length; i++) {
        await mockCreateFuncionario(data[i]);
    }
};

const runBatched = async (data: number[], chunkSize: number) => {
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await Promise.all(chunk.map(item => mockCreateFuncionario(item)));
    }
};

async function runBenchmark() {
    const data = Array.from({ length: 100 }, (_, i) => i);

    console.log("Starting Baseline (Sequential)...");
    const start1 = performance.now();
    await runSequential(data);
    const end1 = performance.now();
    const time1 = end1 - start1;
    console.log(`Sequential: ${time1.toFixed(2)} ms`);

    console.log("Starting Optimization (Batched CHUNK_SIZE=10)...");
    const start2 = performance.now();
    await runBatched(data, 10);
    const end2 = performance.now();
    const time2 = end2 - start2;
    console.log(`Batched: ${time2.toFixed(2)} ms`);

    console.log(`Improvement: ${((time1 - time2) / time1 * 100).toFixed(2)}% faster`);
}

runBenchmark().catch(console.error);
