import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response.js';

const prisma = new PrismaClient();

// ============================================
// SYSTEM SETTINGS
// ============================================

// Get all system settings (grouped by category)
export const getAllSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      
      // Parse value based on dataType
      let parsedValue = setting.value;
      try {
        if (setting.dataType === 'boolean') {
          parsedValue = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          parsedValue = parseFloat(setting.value);
        } else if (setting.dataType === 'json' || setting.dataType === 'array') {
          parsedValue = JSON.parse(setting.value);
        }
      } catch (error) {
        console.error(`Error parsing setting ${setting.key}:`, error);
      }

      acc[setting.category].push({
        id: setting.id,
        key: setting.key,
        value: parsedValue,
        dataType: setting.dataType,
        label: setting.label,
        description: setting.description,
        isEditable: setting.isEditable,
      });
      
      return acc;
    }, {});

    return sendSuccess(res, 'Settings retrieved successfully', groupedSettings);
  } catch (error) {
    console.error('Get all settings error:', error);
    return sendError(res, 'Failed to retrieve settings');
  }
};

// Get settings by category
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const settings = await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { displayOrder: 'asc' },
    });

    // Parse values
    const parsedSettings = settings.map(setting => {
      let parsedValue = setting.value;
      try {
        if (setting.dataType === 'boolean') {
          parsedValue = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          parsedValue = parseFloat(setting.value);
        } else if (setting.dataType === 'json' || setting.dataType === 'array') {
          parsedValue = JSON.parse(setting.value);
        }
      } catch (error) {
        console.error(`Error parsing setting ${setting.key}:`, error);
      }

      return {
        id: setting.id,
        key: setting.key,
        value: parsedValue,
        dataType: setting.dataType,
        label: setting.label,
        description: setting.description,
        isEditable: setting.isEditable,
      };
    });

    return sendSuccess(res, `Settings for category '${category}' retrieved successfully`, parsedSettings);
  } catch (error) {
    console.error('Get settings by category error:', error);
    return sendError(res, 'Failed to retrieve settings');
  }
};

// Get single setting by key
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return sendError(res, 'Setting not found', 404);
    }

    // Parse value
    let parsedValue = setting.value;
    try {
      if (setting.dataType === 'boolean') {
        parsedValue = setting.value === 'true';
      } else if (setting.dataType === 'number') {
        parsedValue = parseFloat(setting.value);
      } else if (setting.dataType === 'json' || setting.dataType === 'array') {
        parsedValue = JSON.parse(setting.value);
      }
    } catch (error) {
      console.error(`Error parsing setting ${setting.key}:`, error);
    }

    const settingData = {
      id: setting.id,
      category: setting.category,
      key: setting.key,
      value: parsedValue,
      dataType: setting.dataType,
      label: setting.label,
      description: setting.description,
      isEditable: setting.isEditable,
    };

    return sendSuccess(res, 'Setting retrieved successfully', settingData);
  } catch (error) {
    console.error('Get setting by key error:', error);
    return sendError(res, 'Failed to retrieve setting');
  }
};

// Update single setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // Check if setting exists and is editable
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return sendError(res, 'Setting not found', 404);
    }

    if (!existingSetting.isEditable) {
      return sendError(res, 'This setting cannot be modified', 403);
    }

    // Store old value for audit
    req.auditOldValue = { value: existingSetting.value };

    // Convert value to string based on dataType
    let stringValue = value;
    if (existingSetting.dataType === 'boolean') {
      stringValue = value.toString();
    } else if (existingSetting.dataType === 'number') {
      stringValue = value.toString();
    } else if (existingSetting.dataType === 'json' || existingSetting.dataType === 'array') {
      stringValue = JSON.stringify(value);
    }

    // Update setting
    const updatedSetting = await prisma.systemSetting.update({
      where: { key },
      data: {
        value: stringValue,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        resource: 'system_settings',
        resourceId: updatedSetting.id,
        oldValue: JSON.stringify(req.auditOldValue),
        newValue: JSON.stringify({ value: stringValue }),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, 'Setting updated successfully', {
      key: updatedSetting.key,
      value: value,
    });
  } catch (error) {
    console.error('Update setting error:', error);
    return sendError(res, 'Failed to update setting');
  }
};

// Update multiple settings
export const updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value }

    if (!Array.isArray(settings) || settings.length === 0) {
      return sendError(res, 'Settings array is required', 400);
    }

    const updatePromises = settings.map(async ({ key, value }) => {
      const existingSetting = await prisma.systemSetting.findUnique({
        where: { key },
      });

      if (!existingSetting || !existingSetting.isEditable) {
        return null;
      }

      // Convert value to string based on dataType
      let stringValue = value;
      if (existingSetting.dataType === 'boolean') {
        stringValue = value.toString();
      } else if (existingSetting.dataType === 'number') {
        stringValue = value.toString();
      } else if (existingSetting.dataType === 'json' || existingSetting.dataType === 'array') {
        stringValue = JSON.stringify(value);
      }

      return prisma.systemSetting.update({
        where: { key },
        data: { value: stringValue },
      });
    });

    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(r => r !== null);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'BULK_UPDATE',
        resource: 'system_settings',
        newValue: JSON.stringify(settings),
        status: 'success',
        metadata: JSON.stringify({ count: successfulUpdates.length }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, `${successfulUpdates.length} settings updated successfully`, {
      updatedCount: successfulUpdates.length,
    });
  } catch (error) {
    console.error('Update multiple settings error:', error);
    return sendError(res, 'Failed to update settings');
  }
};

// Get public settings (for unauthenticated access)
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { isPublic: true },
      orderBy: { category: 'asc' },
    });

    const settingsData = {};
    settings.forEach(setting => {
      let parsedValue = setting.value;
      try {
        if (setting.dataType === 'boolean') {
          parsedValue = setting.value === 'true';
        } else if (setting.dataType === 'number') {
          parsedValue = parseFloat(setting.value);
        } else if (setting.dataType === 'json' || setting.dataType === 'array') {
          parsedValue = JSON.parse(setting.value);
        }
      } catch (error) {
        console.error(`Error parsing setting ${setting.key}:`, error);
      }
      settingsData[setting.key] = parsedValue;
    });

    return sendSuccess(res, 'Public settings retrieved successfully', settingsData);
  } catch (error) {
    console.error('Get public settings error:', error);
    return sendError(res, 'Failed to retrieve public settings');
  }
};

// Reset settings to defaults
export const resetSettings = async (req, res) => {
  try {
    const { category } = req.body;

    // This is a placeholder - you would need to define default values
    // For now, just log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESET_SETTINGS',
        resource: 'system_settings',
        metadata: JSON.stringify({ category: category || 'all' }),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, 'Settings reset to defaults');
  } catch (error) {
    console.error('Reset settings error:', error);
    return sendError(res, 'Failed to reset settings');
  }
};

// ============================================
// APPLICATION CONFIGURATION
// ============================================

// Get all application configs
export const getAllConfigs = async (req, res) => {
  try {
    const { environment } = req.query;

    const where = environment ? { environment } : {};

    const configs = await prisma.applicationConfig.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    const configData = configs.map(config => ({
      id: config.id,
      key: config.key,
      value: JSON.parse(config.value),
      environment: config.environment,
      description: config.description,
      updatedAt: config.updatedAt,
    }));

    return sendSuccess(res, 'Application configs retrieved successfully', configData);
  } catch (error) {
    console.error('Get all configs error:', error);
    return sendError(res, 'Failed to retrieve configs');
  }
};

// Get config by key
export const getConfigByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const { environment } = req.query;

    const where = { key };
    if (environment) {
      where.environment = environment;
    }

    const config = await prisma.applicationConfig.findFirst({
      where,
    });

    if (!config) {
      return sendError(res, 'Config not found', 404);
    }

    const configData = {
      id: config.id,
      key: config.key,
      value: JSON.parse(config.value),
      environment: config.environment,
      description: config.description,
    };

    return sendSuccess(res, 'Config retrieved successfully', configData);
  } catch (error) {
    console.error('Get config by key error:', error);
    return sendError(res, 'Failed to retrieve config');
  }
};

// Create application config
export const createConfig = async (req, res) => {
  try {
    const { key, value, environment, description } = req.body;

    // Check if config already exists
    const existing = await prisma.applicationConfig.findFirst({
      where: { key, environment: environment || 'production' },
    });

    if (existing) {
      return sendError(res, 'Config with this key already exists for this environment', 400);
    }

    const config = await prisma.applicationConfig.create({
      data: {
        key,
        value: JSON.stringify(value),
        environment: environment || 'production',
        description,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        resource: 'application_configs',
        resourceId: config.id,
        newValue: JSON.stringify({ key, value, environment }),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, 'Config created successfully', {
      id: config.id,
      key: config.key,
      value: JSON.parse(config.value),
    }, 201);
  } catch (error) {
    console.error('Create config error:', error);
    return sendError(res, 'Failed to create config');
  }
};

// Update application config
export const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, description } = req.body;

    const existingConfig = await prisma.applicationConfig.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return sendError(res, 'Config not found', 404);
    }

    const updatedConfig = await prisma.applicationConfig.update({
      where: { id },
      data: {
        value: JSON.stringify(value),
        description: description !== undefined ? description : existingConfig.description,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        resource: 'application_configs',
        resourceId: id,
        oldValue: existingConfig.value,
        newValue: updatedConfig.value,
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, 'Config updated successfully', {
      id: updatedConfig.id,
      key: updatedConfig.key,
      value: JSON.parse(updatedConfig.value),
    });
  } catch (error) {
    console.error('Update config error:', error);
    return sendError(res, 'Failed to update config');
  }
};

// Delete application config
export const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await prisma.applicationConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return sendError(res, 'Config not found', 404);
    }

    await prisma.applicationConfig.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        resource: 'application_configs',
        resourceId: id,
        oldValue: JSON.stringify(config),
        status: 'success',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return sendSuccess(res, 'Config deleted successfully');
  } catch (error) {
    console.error('Delete config error:', error);
    return sendError(res, 'Failed to delete config');
  }
};

