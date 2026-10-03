const express = require("express");
const multer = require("multer");
const { parse } = require("csv-parse/sync");

const {
  saveCampaign,
  getCampaign,
} = require("../services/campaignStore");

const {
  getCreative,
  normalizeCreativeName,
} = require("../services/creativeStore");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Upload campaign CSV
router.post(
  "/upload",
  upload.single("campaign"),
  async (req, res) => {
    try {
      console.log("=================================");
      console.log("CAMPAIGN CSV UPLOAD STARTED");
      console.log("=================================");

      if (!req.file) {
        return res.status(400).json({
          message: "No CSV file uploaded",
        });
      }

      console.log("File:", req.file.originalname);
      console.log("Size:", req.file.size, "bytes");
      console.log("MIME:", req.file.mimetype);

      // Convert uploaded CSV into text
      const csvText = req.file.buffer.toString("utf-8");

      // Parse CSV
      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (!records.length) {
        return res.status(400).json({
          message: "CSV file is empty",
        });
      }

      // Required columns
      const requiredColumns = [
        "Creative",
        "Impressions",
        "Clicks",
        "Conversions",
        "Spend",
      ];

      const availableColumns = Object.keys(records[0]);

      const missingColumns = requiredColumns.filter(
        (column) => !availableColumns.includes(column)
      );

      if (missingColumns.length > 0) {
        return res.status(400).json({
          message: "Missing required CSV columns",
          missingColumns,
          requiredColumns,
        });
      }

      // Calculate metrics for every creative
      const campaignData = records.map((row) => {
        const impressions = Number(row.Impressions) || 0;
        const clicks = Number(row.Clicks) || 0;
        const conversions = Number(row.Conversions) || 0;
        const spend = Number(row.Spend) || 0;

        const revenue =
          row.Revenue !== undefined
            ? Number(row.Revenue) || 0
            : 0;

        const ctr =
          impressions > 0
            ? (clicks / impressions) * 100
            : 0;

        const cvr =
          clicks > 0
            ? (conversions / clicks) * 100
            : 0;

        const cpc =
          clicks > 0
            ? spend / clicks
            : 0;

        const cpa =
          conversions > 0
            ? spend / conversions
            : 0;

        const roas =
          spend > 0
            ? revenue / spend
            : null;

        return {
          creative: row.Creative,
          impressions,
          clicks,
          conversions,
          spend,
          revenue,

          ctr: Number(ctr.toFixed(2)),
          cvr: Number(cvr.toFixed(2)),
          cpc: Number(cpc.toFixed(2)),
          cpa: Number(cpa.toFixed(2)),

          roas:
            roas !== null
              ? Number(roas.toFixed(2))
              : null,
        };
      });

      // Overall totals
      const totalImpressions = campaignData.reduce(
        (sum, row) => sum + row.impressions,
        0
      );

      const totalClicks = campaignData.reduce(
        (sum, row) => sum + row.clicks,
        0
      );

      const totalConversions = campaignData.reduce(
        (sum, row) => sum + row.conversions,
        0
      );

      const totalSpend = campaignData.reduce(
        (sum, row) => sum + row.spend,
        0
      );

      const totalRevenue = campaignData.reduce(
        (sum, row) => sum + row.revenue,
        0
      );

      const overallCTR =
        totalImpressions > 0
          ? (totalClicks / totalImpressions) * 100
          : 0;

      const overallCVR =
        totalClicks > 0
          ? (totalConversions / totalClicks) * 100
          : 0;

      const overallCPC =
        totalClicks > 0
          ? totalSpend / totalClicks
          : 0;

      const overallCPA =
        totalConversions > 0
          ? totalSpend / totalConversions
          : 0;

      const overallROAS =
        totalSpend > 0
          ? totalRevenue / totalSpend
          : null;

      const result = {
        message: "Campaign CSV processed successfully",

        summary: {
          totalImpressions,
          totalClicks,
          totalConversions,

          totalSpend: Number(
            totalSpend.toFixed(2)
          ),

          totalRevenue: Number(
            totalRevenue.toFixed(2)
          ),

          ctr: Number(
            overallCTR.toFixed(2)
          ),

          cvr: Number(
            overallCVR.toFixed(2)
          ),

          cpc: Number(
            overallCPC.toFixed(2)
          ),

          cpa: Number(
            overallCPA.toFixed(2)
          ),

          roas:
            overallROAS !== null
              ? Number(
                  overallROAS.toFixed(2)
                )
              : null,
        },

        campaignData,
      };

      // Save campaign data in memory
      saveCampaign(result);

      console.log("Campaign CSV processed successfully!");
      console.log("Rows:", campaignData.length);
      console.log("CTR:", result.summary.ctr);
      console.log("CVR:", result.summary.cvr);
      console.log("CPC:", result.summary.cpc);
      console.log("CPA:", result.summary.cpa);
      console.log("ROAS:", result.summary.roas);

      return res.status(201).json(result);
    } catch (error) {
      console.error("=================================");
      console.error("CAMPAIGN CSV ERROR");
      console.error("=================================");
      console.error(error);

      return res.status(500).json({
        message: "Failed to process campaign CSV",
        error: error.message,
      });
    }
  }
);

router.get("/latest", (req, res) => {
  const campaign = getCampaign();

  if (!campaign) {
    return res.status(404).json({
      message: "No campaign data uploaded yet.",
    });
  }

  const enrichedCampaignData =
    campaign.campaignData.map((row) => {
      const creative = getCreative(row.creative);

      return {
        ...row,

        creativeAnalysis: creative
          ? creative.analysis
          : null,

        cloudinaryUrl: creative
          ? creative.url
          : null,
      };
    });

  res.json({
    ...campaign,
    campaignData: enrichedCampaignData,
  });
});

module.exports = router;