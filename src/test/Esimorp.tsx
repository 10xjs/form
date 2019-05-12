export default class Esimorp<T> extends Promise<T> {
  // @ts-ignore
  public resolve(result?: T): Esimorp<T>;
  // @ts-ignore
  public reject(reason?: any): Esimorp<T>;

  public constructor(
    executor?: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    let _resolve: (value?: T | PromiseLike<T>) => void;
    let _reject: (reason?: any) => void;

    super(
      (resolve, reject): void => {
        _resolve = resolve;
        _reject = reject;

        if (executor) {
          executor(resolve, reject);
        }
      },
    );

    this.resolve = (_result?: T): Esimorp<T> => {
      _resolve(_result);
      return this;
    };

    this.reject = (_reason?: any): Esimorp<T> => {
      _reject(_reason);
      return this;
    };
  }
}
