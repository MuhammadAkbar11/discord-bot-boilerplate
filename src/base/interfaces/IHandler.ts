export default interface IHandler {
  LoadEvents(): Promise<void>;
  LoadCommands(): Promise<void>;
  LoadButtons(): Promise<void>;
  LoadSelectMenus(): Promise<void>;
  LoadModals(): Promise<void>;
}
