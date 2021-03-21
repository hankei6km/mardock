declare module 'unified-stream' {
  import { Processor } from 'unified';
  import { EventEmitter } from 'event';

  const stream = (Processor) => EventEmitter;

  export default stream;
}
