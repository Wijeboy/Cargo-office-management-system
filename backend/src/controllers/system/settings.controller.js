import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all settings grouped by category
export const getAllSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Group by category
    const grouped = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        id: setting.id,
        key: setting.key,
        value: setting.type === 'json' ? JSON.parse(setting.value) : setting.value,
        type: setting.type,
        description: setting.description,
        isPublic: setting.isPublic,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get settings by category
export const getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });

    res.json({
      success: true,
      data: settings.map(s => ({
        ...s,
        value: s.type === 'json' ? JSON.parse(s.value) : s.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type, description } = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: type === 'json' ? JSON.stringify(value) : String(value),
        type: type || 'string',
        description,
      },
      create: {
        key,
        value: type === 'json' ? JSON.stringify(value) : String(value),
        type: type || 'string',
        description,
        category: req.body.category || 'general',
      },
    });

    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update settings
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // [{ key, value, type }]
    
    const updates = await Promise.all(
      settings.map(s =>
        prisma.systemSetting.upsert({
          where: { key: s.key },
          update: { value: s.type === 'json' ? JSON.stringify(s.value) : String(s.value) },
          create: {
            key: s.key,
            value: s.type === 'json' ? JSON.stringify(s.value) : String(s.value),
            type: s.type || 'string',
            category: s.category || 'general',
          },
        })
      )
    );

    res.json({ success: true, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
