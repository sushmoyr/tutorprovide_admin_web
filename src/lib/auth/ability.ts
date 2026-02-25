import {
  createMongoAbility,
  type MongoAbility,
  AbilityBuilder,
} from "@casl/ability";

export type AppAbility = MongoAbility<[string, string]>;

export const defaultAbility = createMongoAbility<AppAbility>();

export function buildAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  permissions.forEach((permission) => can(permission, "all"));
  return build();
}
