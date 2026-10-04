/** Test-only browser lifecycle. Adapters own framework startup and cleanup. */
export interface StoryInstance<Props extends object = Record<string, unknown>> {
  render(props: Props): void | Promise<void>;
  unmount(): void | Promise<void>;
}

export interface Story<Props extends object = Record<string, unknown>> {
  create(host: HTMLElement): StoryInstance<Props> | Promise<StoryInstance<Props>>;
}

export interface MountParameters {
  story: string;
  props?: Record<string, unknown>;
}

export interface StoryGallery {
  mount(parameters: MountParameters): Promise<void>;
  unmount(): Promise<void>;
}

declare global {
  interface Window extends StoryGallery {}
}
