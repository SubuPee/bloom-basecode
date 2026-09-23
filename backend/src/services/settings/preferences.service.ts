import WorkspaceSettings, { IWorkspaceSettings } from "../../models/settings/WorkspaceSettings";

// =====================================================
// GET WORKSPACE PREFERENCES
// =====================================================
export const getPreferences = async () => {
  let settings = await WorkspaceSettings.findOne();

  if (!settings) {
    settings = await WorkspaceSettings.create({
      storeDetails: {
        storeName: "Bloom",
        supportEmail: "care@bloom.store",
        supportPhone: "+91 22 4000 1188",
        storefrontDomain: "bloom.store",
      },
      regional: {
        currency: "INR (₹)",
        timezone: "IST (UTC +5:30)",
        dateFormat: "DD MMM YYYY",
        weightUnit: "Kilogram",
      },
      notificationPreferences: {
        orders: true,
        stock: true,
        payouts: true,
        reviews: false,
        security: true,
      },
    });
  }

  return settings;
};

// =====================================================
// UPDATE WORKSPACE PREFERENCES
// =====================================================
export const updatePreferences = async (data: {
  storeDetails?: Partial<IWorkspaceSettings["storeDetails"]>;
  regional?: Partial<IWorkspaceSettings["regional"]>;
  notificationPreferences?: Partial<IWorkspaceSettings["notificationPreferences"]>;
}) => {
  let settings = await WorkspaceSettings.findOne();

  if (!settings) {
    settings = new WorkspaceSettings();
  }

  if (data.storeDetails) {
    settings.storeDetails = {
      ...settings.storeDetails,
      ...data.storeDetails,
    };
  }

  if (data.regional) {
    settings.regional = {
      ...settings.regional,
      ...data.regional,
    };
  }

  if (data.notificationPreferences) {
    settings.notificationPreferences = {
      ...settings.notificationPreferences,
      ...data.notificationPreferences,
    };
  }

  await settings.save();
  return settings;
};
