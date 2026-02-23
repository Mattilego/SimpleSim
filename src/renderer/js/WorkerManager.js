export class WorkerManager {
  constructor(poolSize = navigator.hardwareConcurrency || 4) {
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.activeTasks = 0;
    
    this._initializePool();
  }

  _initializePool() {
    for (let i = 0; i < this.poolSize-this.workers.length; i++) {
      const worker = new Worker(new URL('../../shared/engine/webWorkerWrapper.js', import.meta.url), { type: 'module' });
      this.workers.push({
        instance: worker,
        busy: false,
        id: i
      });
    }
  }

  /**
   * Executes a task on the next available worker.
   * @param {any} payload - Data to send to the worker.
   * @returns {Promise} - Resolves with worker's response.
   */
  run(payload) {
    return new Promise((resolve, reject) => {
      const task = { payload, resolve, reject };
      
      const availableWorker = this.workers.find(w => !w.busy);

      if (availableWorker) {
        this._execute(availableWorker, task);
      } else {
        this.queue.push(task);
      }
    });
  }

  _execute(worker, task) {
    worker.busy = true;
    this.activeTasks++;

    const cleanup = () => {
      worker.instance.removeEventListener('message', onMessage);
      worker.instance.removeEventListener('error', onError);
      worker.busy = false;
      this.activeTasks--;
      
      // Check if there are pending tasks in the queue
      if (this.queue.length > 0) {
        this._execute(worker, this.queue.shift());
      }
    };

    const onMessage = (e) => {
      cleanup();
      task.resolve(e.data);
    };

    const onError = (e) => {
      cleanup();
      task.reject(e);
    };

    worker.instance.addEventListener('message', onMessage);
    worker.instance.addEventListener('error', onError);
    worker.instance.postMessage(task.payload);
  }

  terminate() {
    this.workers.forEach(w => w.instance.terminate());
    this.workers = [];
    this.queue = [];
  }
}