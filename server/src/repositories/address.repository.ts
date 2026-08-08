import { Address, IAddressDocument } from '../models/address.model.js';

export class AddressRepository {
  async findByUser(userId: string): Promise<IAddressDocument[]> {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findByIdAndUser(id: string, userId: string): Promise<IAddressDocument | null> {
    return Address.findOne({ _id: id, userId });
  }

  async create(userId: string, data: Partial<IAddressDocument>): Promise<IAddressDocument> {
    if (data.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    } else {
      const count = await Address.countDocuments({ userId });
      if (count === 0) data.isDefault = true;
    }

    const address = new Address({ ...data, userId });
    return address.save();
  }

  async update(id: string, userId: string, data: Partial<IAddressDocument>): Promise<IAddressDocument | null> {
    if (data.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    return Address.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const res = await Address.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }

  async setDefault(id: string, userId: string): Promise<IAddressDocument | null> {
    await Address.updateMany({ userId }, { isDefault: false });
    return Address.findOneAndUpdate({ _id: id, userId }, { isDefault: true }, { new: true });
  }
}

export const addressRepository = new AddressRepository();
