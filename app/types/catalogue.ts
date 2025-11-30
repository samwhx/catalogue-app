export interface Option {
  id: string;
  identifier?: string;
  name: string;
  description?: string | null;
  price?: string;
  currency?: string;
  display_order?: number;
  active?: boolean;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  price?: string;
  currency?: string;
  description?: string;
  image_url?: string | null;
  display_order?: number;
  active?: boolean;
  options: Option[];
}

export interface Section {
  id: string;
  identifier: string;
  name: string;
  description?: string;
  image_url?: string | null;
  display_order?: number;
  active?: boolean;
  sub_sections: Section[];
  items: Item[];
}

export interface Catalog {
  id: string;
  identifier: string;
  name: string;
  sections: Section[];
}

export interface CatalogMetadata {
  id: string;
  identifier: string;
  name: string;
}
