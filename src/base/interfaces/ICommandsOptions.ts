import ECategory from "../enums/ECategory";

export default interface ICommanddOptions {
  name: string;
  description: string;
  category: ECategory;
  options: object;
  default_member_permissions: bigint;
  dm_permission: boolean;
  cooldown: number;
  dev: boolean;
}
