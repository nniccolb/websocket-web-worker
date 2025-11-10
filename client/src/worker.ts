import * as Comlink from 'comlink';

const api = {
  async processData(task: string): Promise<string> {
    return `Processed: ${task}`;
  }
};

Comlink.expose(api);
