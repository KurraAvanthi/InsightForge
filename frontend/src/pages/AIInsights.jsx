import { useEffect, useState } from "react";
import "./AIInsights.css";

function AIInsights() {
  const [openPattern, setOpenPattern] = useState(null);
  const [openRecommendation, setOpenRecommendation] = useState(null);

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD CAMPAIGN DATA
  // =========================================================

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/campaigns/latest"
        );

        if (!response.ok) {
          throw new Error("No campaign data available");
        }

        const data = await response.json();

        console.log("AI Insights campaign data:", data);

        setCampaign(data);
      } catch (error) {
        console.log(
          "AI Insights data unavailable:",
          error.message
        );

        setCampaign(null);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignData();
  }, []);

  // =========================================================
  // CAMPAIGN DATA
  // =========================================================

  const campaignData = campaign?.campaignData || [];

  const summary = campaign?.summary || {
    ctr: 0,
    cvr: 0,
    cpc: 0,
    cpa: 0,
    roas: null,
  };

  // =========================================================
  // TOP CREATIVE
  // =========================================================

  const topCreative =
    campaignData.length > 0
      ? campaignData.reduce((best, current) =>
          Number(current.ctr) > Number(best.ctr)
            ? current
            : best
        )
      : null;

  // =========================================================
  // LOWEST CREATIVE
  // =========================================================

  const lowestCreative =
    campaignData.length > 0
      ? campaignData.reduce((lowest, current) =>
          Number(current.ctr) < Number(lowest.ctr)
            ? current
            : lowest
        )
      : null;

  // =========================================================
  // CTR RANGE
  // =========================================================

  const ctrRange =
    topCreative && lowestCreative
      ? (
          Number(topCreative.ctr) -
          Number(lowestCreative.ctr)
        ).toFixed(2)
      : "0.00";

  // =========================================================
  // DYNAMIC INSIGHTS
  // =========================================================

  const insights = [
    {
      number: "01",
      type: "PERFORMANCE SIGNAL",

      title: topCreative
        ? `${topCreative.creative} has the highest CTR`
        : "Highest-performing creative",

      description: topCreative
        ? `${topCreative.creative} has the highest observed CTR in the uploaded campaign dataset. This makes it a useful candidate for further testing and comparison.`
        : "Upload campaign data to identify the highest-performing creative.",

      metric: topCreative
        ? `${Number(topCreative.ctr).toFixed(2)}%`
        : "—",

      metricLabel: "Observed CTR",
      icon: "↗",
    },

    {
      number: "02",
      type: "PERFORMANCE SIGNAL",

      title: "CTR variation across creatives",

      description:
        campaignData.length > 1
          ? `The difference between the highest and lowest observed CTR is ${ctrRange} percentage points. This variation indicates that creative-level performance differs within the current dataset.`
          : "Upload multiple creatives to compare CTR variation.",

      metric: `${ctrRange}%`,
      metricLabel: "CTR spread",
      icon: "◈",
    },

    {
      number: "03",
      type: "CONVERSION SIGNAL",

      title: "Overall conversion performance",

      description:
        campaignData.length > 0
          ? `The uploaded campaign has an overall conversion rate of ${Number(
              summary.cvr
            ).toFixed(
              2
            )}%. Use this as a baseline when testing new creative variations.`
          : "Upload campaign data to calculate the overall conversion rate.",

      metric: `${Number(summary.cvr).toFixed(2)}%`,
      metricLabel: "Overall CVR",
      icon: "◎",
    },
  ];

  // =========================================================
  // DYNAMIC RECOMMENDATIONS
  // =========================================================

  const recommendations = [
    {
      priority: "HIGH PRIORITY",

      title: topCreative
        ? `Study ${topCreative.creative} as a reference`
        : "Identify your strongest creative",

      description: topCreative
        ? `${topCreative.creative} currently has the highest observed CTR at ${Number(
            topCreative.ctr
          ).toFixed(
            2
          )}%. Compare its creative characteristics with lower-performing creatives before creating new variations.`
        : "Upload campaign data to identify the strongest-performing creative.",

      icon: "◈",
    },

    {
      priority: "MEDIUM PRIORITY",

      title: "Test one creative variable at a time",

      description:
        "Create controlled variations by changing one visual element at a time, such as product placement, text density, composition, or CTA prominence. Compare each variation against the current performance baseline.",

      icon: "Aa",
    },

    {
      priority: "MEDIUM PRIORITY",

      title: "Use campaign metrics as your baseline",

      description: `The current campaign baseline is ${Number(
        summary.ctr
      ).toFixed(2)}% CTR and ${Number(
        summary.cvr
      ).toFixed(2)}% CVR. Use these values when evaluating future creative experiments.`,

      icon: "→",
    },
  ];

  // =========================================================
  // TOGGLE FUNCTIONS
  // =========================================================

  const togglePattern = (index) => {
    setOpenPattern(
      openPattern === index ? null : index
    );
  };

  const toggleRecommendation = (index) => {
    setOpenRecommendation(
      openRecommendation === index ? null : index
    );
  };

  // =========================================================
  // BACK BUTTON
  // =========================================================

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="insights-page">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        className="insights-back-button"
        onClick={handleBack}
        aria-label="Go back"
        title="Go back"
        type="button"
      >
        ←
      </button>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="insights-header">
        <p className="page-label">
          AI-POWERED INTELLIGENCE
        </p>

        <h1>AI Insights</h1>

        <p className="page-description">
          Turn creative analysis and campaign performance
          data into actionable marketing intelligence.
        </p>
      </div>

      {/* =====================================================
          CAMPAIGN SUMMARY
      ===================================================== */}

      <section className="insight-summary">

        <div className="summary-icon">
          ✦
        </div>

        <div className="summary-content">

          <p className="summary-label">
            CAMPAIGN SUMMARY
          </p>

          <h2>
            {loading
              ? "Analyzing your campaign data..."
              : campaignData.length > 0
              ? "Your campaign data shows several performance signals"
              : "Upload campaign data to generate insights"}
          </h2>

          <p>
            {campaignData.length > 0
              ? "InsightForge uses the uploaded campaign metrics to identify performance differences, surface useful signals, and suggest controlled creative tests."
              : "Upload a campaign CSV from Campaign Analytics to generate data-driven performance insights."}
          </p>

        </div>

        <div className="summary-score">

          <span>
            INSIGHT SIGNAL
          </span>

          <strong>
            {loading
              ? "..."
              : campaignData.length > 0
              ? "LIVE"
              : "—"}
          </strong>

          <small>
            Based on current dataset
          </small>

        </div>

      </section>

      {/* =====================================================
          PERFORMANCE SNAPSHOT
      ===================================================== */}

      <div className="section-heading">

        <p className="page-label">
          PERFORMANCE SNAPSHOT
        </p>

        <h2>
          What the data is showing
        </h2>

      </div>

      {/* =====================================================
          PERFORMANCE METRICS
      ===================================================== */}

      <div className="insight-metrics">

        <div className="insight-metric-card">

          <span>
            Avg. CTR
          </span>

          <strong>
            {loading
              ? "..."
              : `${Number(summary.ctr).toFixed(2)}%`}
          </strong>

          <small>
            Across uploaded creatives
          </small>

        </div>

        <div className="insight-metric-card">

          <span>
            Avg. CVR
          </span>

          <strong>
            {loading
              ? "..."
              : `${Number(summary.cvr).toFixed(2)}%`}
          </strong>

          <small>
            Conversion rate
          </small>

        </div>

        <div className="insight-metric-card">

          <span>
            Top CTR
          </span>

          <strong>
            {loading
              ? "..."
              : topCreative
              ? `${Number(topCreative.ctr).toFixed(2)}%`
              : "—"}
          </strong>

          <small>
            Highest observed creative
          </small>

        </div>

        <div className="insight-metric-card">

          <span>
            Creatives
          </span>

          <strong>
            {loading
              ? "..."
              : campaignData.length}
          </strong>

          <small>
            In current dataset
          </small>

        </div>

      </div>

      {/* =====================================================
          DETECTED PATTERNS
      ===================================================== */}

      <div className="section-heading patterns-heading">

        <p className="page-label">
          DETECTED PATTERNS
        </p>

        <h2>
          Performance signals from your campaign
        </h2>

      </div>

      <div className="insights-grid">

        {insights.map((insight, index) => (

          <div
            className={`insight-card ${
              openPattern === index
                ? "expanded"
                : ""
            }`}
            key={insight.number}
          >

            {/* CLICKABLE HEADER */}

            <button
              className="insight-card-toggle"
              onClick={() => togglePattern(index)}
              type="button"
            >

              <div className="insight-card-top">

                <span className="insight-number">
                  {insight.number}
                </span>

                <span className="insight-type">
                  {insight.type}
                </span>

              </div>

              <div className="insight-toggle-icon">
                {openPattern === index
                  ? "−"
                  : "+"}
              </div>

            </button>

            {/* TITLE */}

            <div className="pattern-preview">

              <div className="pattern-icon">
                {insight.icon}
              </div>

              <h3>
                {insight.title}
              </h3>

            </div>

            {/* EXPANDED CONTENT */}

            {openPattern === index && (

              <div className="insight-expanded-content">

                <p>
                  {insight.description}
                </p>

                <div className="observed-metric">

                  <strong>
                    {insight.metric}
                  </strong>

                  <span>
                    {insight.metricLabel}
                  </span>

                </div>

              </div>

            )}

          </div>

        ))}

      </div>

      {/* =====================================================
          RECOMMENDATIONS
      ===================================================== */}

      <div className="section-heading recommendations-heading">

        <p className="page-label">
          AI RECOMMENDATIONS
        </p>

        <h2>
          What you could test next
        </h2>

      </div>

      <div className="recommendations-container">

        {recommendations.map(
          (recommendation, index) => (

            <div
              className={`recommendation-card ${
                openRecommendation === index
                  ? "expanded"
                  : ""
              }`}
              key={index}
            >

              {/* CLICKABLE HEADER */}

              <button
                className="recommendation-toggle"
                onClick={() =>
                  toggleRecommendation(index)
                }
                type="button"
              >

                <div className="recommendation-icon">
                  {recommendation.icon}
                </div>

                <div className="recommendation-content">

                  <span className="recommendation-priority">
                    {recommendation.priority}
                  </span>

                  <h3>
                    {recommendation.title}
                  </h3>

                </div>

                <div className="recommendation-arrow">

                  {openRecommendation === index
                    ? "−"
                    : "+"}

                </div>

              </button>

              {/* EXPANDED CONTENT */}

              {openRecommendation === index && (

                <div className="recommendation-expanded-content">

                  <p>
                    {recommendation.description}
                  </p>

                </div>

              )}

            </div>

          )
        )}

      </div>

      {/* =====================================================
          TESTING STRATEGY
      ===================================================== */}

      <section className="testing-card">

        <div className="testing-icon">
          ✦
        </div>

        <div className="testing-content">

          <p className="page-label">
            NEXT STEP
          </p>

          <h2>
            Turn insights into creative experiments
          </h2>

          <p>
            Use these observations as hypotheses for your
            next campaign. Create variations that change
            one visual element at a time and compare their
            performance.
          </p>

        </div>

        <div className="testing-badge">
          AI READY
        </div>

      </section>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="insights-footer">

        <span>
          ✦
        </span>

        <p>
          Insights are based on observed associations in
          the available campaign data and should be
          validated through controlled testing.
        </p>

      </div>

    </div>
  );
}

export default AIInsights;