import type { Schema, Struct } from '@strapi/strapi';

export interface OrderInvoiceData extends Struct.ComponentSchema {
  collectionName: 'components_order_invoice_data';
  info: {
    displayName: 'Invoice Data';
    icon: 'file-invoice';
  };
  attributes: {
    address: Schema.Attribute.String;
    city: Schema.Attribute.String;
    companyName: Schema.Attribute.String;
    country: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2;
      }> &
      Schema.Attribute.DefaultTo<'PL'>;
    nip: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    postalCode: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 6;
      }>;
  };
}

export interface OrderOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_order_order_items';
  info: {
    displayName: 'Order Item';
    icon: 'shopping-cart';
  };
  attributes: {
    ebook: Schema.Attribute.Relation<'oneToOne', 'api::ebook.ebook'>;
    ebookTitle: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'order.invoice-data': OrderInvoiceData;
      'order.order-item': OrderOrderItem;
    }
  }
}
