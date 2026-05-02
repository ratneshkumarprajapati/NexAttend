export interface CreateAccessPointInput {
  name: string;
  routerKey?: string | undefined;
  routerName?: string | undefined;
  routerProvider?: string | undefined;
  location?: string | undefined;
  ssidIndex?: number | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateAccessPointInput {
  name?: string | undefined;
  routerKey?: string | undefined;
  routerName?: string | undefined;
  routerProvider?: string | undefined;
  location?: string | undefined;
  ssidIndex?: number | undefined;
  isActive?: boolean | undefined;
}

export interface RouterAccessPointIdentity {
  routerKey: string;
  routerName?: string | undefined;
  routerProvider?: string | undefined;
}
