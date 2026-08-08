import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  action: string;
  entityType: 'User' | 'Restaurant' | 'Order' | 'Food' | 'Category' | 'Coupon' | 'Platform';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['User', 'Restaurant', 'Order', 'Food', 'Category', 'Coupon', 'Platform'],
      required: true,
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
