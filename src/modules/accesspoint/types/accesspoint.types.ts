export interface CreateAccessPointInput {
  name: string;
  location?: string | undefined;
  ssidIndex?: number | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateAccessPointInput {
  name?: string | undefined;
  location?: string | undefined;
  ssidIndex?: number | undefined;
  isActive?: boolean | undefined;
}
