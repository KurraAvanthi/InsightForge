import { useState } from "react";

import "./CampaignAnalytics.css";

function CampaignAnalytics() {
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploaded, setUploaded] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    ctr: 0,
    cvr: 0,
    cpc: 0,
    cpa: 0,
    roas: null,
  });

  const [campaignData, setCampaignData] = useState([]);

  // =================================
  // CSV UPLOAD
  // =================================

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Reset previous state
    setError("");
    setUploaded(false);
    setSelectedFile(null);

    // Check file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    // Backend allows 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("CSV file must be smaller than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    const formData = new FormData();

    // Backend expects the field name "campaign"
    formData.append("campaign", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/campaigns/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      // Safely read the response
      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Backend returned non-JSON response:",
          text
        );

        throw new Error(
          response.ok
            ? "Backend returned an unexpected response."
            : `Backend error (${response.status}). Please make sure the backend is running.`
        );
      }

      // Handle backend errors
      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to process campaign CSV."
        );
      }

      console.log(
        "Campaign API response:",
        data
      );

      // Make sure expected data exists
      if (
        !data.summary ||
        !Array.isArray(data.campaignData)
      ) {
        throw new Error(
          "The backend response is missing campaign data."
        );
      }

      // Save backend summary
      setSummary(data.summary);

      // Save backend campaign rows
      setCampaignData(data.campaignData);

      setUploaded(true);
    } catch (err) {
      console.error(
        "Campaign upload error:",
        err
      );

      let message = err.message;

      if (
        err.name === "TypeError" &&
        err.message
          .toLowerCase()
          .includes("fetch")
      ) {
        message =
          "Unable to connect to the campaign analytics backend. Make sure the backend is running on port 5000.";
      }

      setError(
        message ||
          "Failed to process campaign CSV."
      );

      setUploaded(false);
      setCampaignData([]);
    } finally {
      setUploading(false);
    }
  };

  // =================================
  // GO BACK
  // =================================

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="campaign-page">

      {/* =================================
          BACK BUTTON
      ================================== */}

      <button
        className="back-button"
        onClick={handleBack}
        aria-label="Go back"
        title="Go back"
      >
        ←
      </button>

      {/* =================================
          HEADER
      ================================== */}

      <div className="campaign-header">

        <div>

          <p className="page-label">
            CAMPAIGN INTELLIGENCE
          </p>

          <h1>
            Campaign Analytics
          </h1>

          <p className="page-description">
            Connect campaign performance data with
            your creatives to understand what is
            associated with stronger marketing results.
          </p>

        </div>

      </div>

      {/* =================================
          CSV UPLOAD
      ================================== */}

      <div className="campaign-upload-card">

        <div className="campaign-upload-icon">
          📄
        </div>

        <div className="campaign-upload-content">

          <h2>
            Upload Campaign Data
          </h2>

          <p>
            Upload a CSV containing impressions,
            clicks, conversions, spend and other
            campaign performance metrics.
          </p>

          <input
            id="campaign-csv"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            hidden
          />

          <label
            htmlFor="campaign-csv"
            className="campaign-upload-button"
          >
            {uploading
              ? "Processing CSV..."
              : "Browse CSV Files"}
          </label>

          {/* Selected CSV */}

          {selectedFile && (
            <div className="selected-csv">

              <span>
                {uploading ? "⏳" : "✓"}
              </span>

              <div>

                <strong>
                  {selectedFile.name}
                </strong>

                <small>
                  {(selectedFile.size / 1024).toFixed(
                    1
                  )}{" "}
                  KB
                </small>

              </div>

            </div>
          )}

          {/* Upload error */}

          {error && (
            <div className="campaign-error">
              {error}
            </div>
          )}

          {/* Success */}

          {uploaded && !error && (
            <div className="campaign-success">
              Campaign data processed successfully.
            </div>
          )}

        </div>

      </div>

      {/* =================================
          PERFORMANCE OVERVIEW
      ================================== */}

      <div className="section-heading">

        <p className="page-label">
          PERFORMANCE OVERVIEW
        </p>

        <h2>
          Campaign Performance
        </h2>

      </div>

      {/* =================================
          METRIC CARDS
      ================================== */}

      <div className="metric-grid">

        {/* CTR */}

        <div className="metric-card">

          <div className="metric-top">

            <span>
              CTR
            </span>

            <div className="metric-icon">
              ↗
            </div>

          </div>

          <h3>
            {summary.ctr.toFixed(2)}%
          </h3>

          <p>
            Overall click-through rate
          </p>

        </div>

        {/* CVR */}

        <div className="metric-card">

          <div className="metric-top">

            <span>
              CVR
            </span>

            <div className="metric-icon">
              ◎
            </div>

          </div>

          <h3>
            {summary.cvr.toFixed(2)}%
          </h3>

          <p>
            Overall conversion rate
          </p>

        </div>

        {/* CPC */}

        <div className="metric-card">

          <div className="metric-top">

            <span>
              CPC
            </span>

            <div className="metric-icon">
              ₹
            </div>

          </div>

          <h3>
            ₹{summary.cpc.toFixed(2)}
          </h3>

          <p>
            Cost per click
          </p>

        </div>

        {/* CPA */}

        <div className="metric-card">

          <div className="metric-top">

            <span>
              CPA
            </span>

            <div className="metric-icon">
              ◉
            </div>

          </div>

          <h3>
            ₹{summary.cpa.toFixed(2)}
          </h3>

          <p>
            Cost per acquisition
          </p>

        </div>

        {/* ROAS */}

        <div className="metric-card">

          <div className="metric-top">

            <span>
              ROAS
            </span>

            <div className="metric-icon">
              ◆
            </div>

          </div>

          <h3>
            {summary.roas !== null
              ? `${summary.roas.toFixed(2)}x`
              : "N/A"}
          </h3>

          <p>
            Return on ad spend
          </p>

        </div>

      </div>

      {/* =================================
          CAMPAIGN DATA TABLE
      ================================== */}

      <div className="table-section">

        <div className="table-header">

          <div>

            <p className="page-label">
              CREATIVE PERFORMANCE
            </p>

            <h2>
              Campaign Data
            </h2>

          </div>

          <span className="data-status">
            {uploaded
              ? "CSV uploaded"
              : "No data uploaded"}
          </span>

        </div>

        <div className="table-wrapper">

          {campaignData.length === 0 ? (

            <div className="empty-campaign-state">
              Upload a campaign CSV to view
              performance data.
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Creative
                  </th>

                  <th>
                    Impressions
                  </th>

                  <th>
                    Clicks
                  </th>

                  <th>
                    Conversions
                  </th>

                  <th>
                    CTR
                  </th>

                  <th>
                    CVR
                  </th>

                  <th>
                    CPC
                  </th>

                  <th>
                    CPA
                  </th>

                  <th>
                    ROAS
                  </th>

                </tr>

              </thead>

              <tbody>

                {campaignData.map(
                  (row, index) => (

                    <tr key={index}>

                      <td>

                        <div className="creative-name">

                          <span className="creative-dot"></span>

                          {row.creative}

                        </div>

                      </td>

                      <td>
                        {row.impressions.toLocaleString()}
                      </td>

                      <td>
                        {row.clicks.toLocaleString()}
                      </td>

                      <td>
                        {row.conversions.toLocaleString()}
                      </td>

                      <td className="metric-value">
                        {row.ctr.toFixed(2)}%
                      </td>

                      <td className="metric-value">
                        {row.cvr.toFixed(2)}%
                      </td>

                      <td className="metric-value">
                        ₹{row.cpc.toFixed(2)}
                      </td>

                      <td className="metric-value">
                        ₹{row.cpa.toFixed(2)}
                      </td>

                      <td className="metric-value">

                        {row.roas !== null
                          ? `${row.roas.toFixed(2)}x`
                          : "N/A"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

      {/* =================================
          CHARTS
      ================================== */}

      {campaignData.length > 0 && (

        <div className="charts-section">

          <div className="section-heading">

            <p className="page-label">
              VISUAL PERFORMANCE
            </p>

            <h2>
              Creative Performance Comparison
            </h2>

          </div>

          <div className="chart-grid">

            {/* CTR CHART */}

            <div className="chart-card">

              <div className="chart-card-header">

                <div>

                  <h3>
                    CTR by Creative
                  </h3>

                  <p>
                    Click-through rate comparison
                  </p>

                </div>

              </div>

              <div className="bar-chart">

                {campaignData.map(
                  (item, index) => {

                    const value =
                      Number(item.ctr) || 0;

                    return (

                      <div
                        className="bar-row"
                        key={index}
                      >

                        <span className="bar-label">
                          {item.creative}
                        </span>

                        <div className="bar-track">

                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.min(
                                value * 10,
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                        <span className="bar-value">
                          {value.toFixed(2)}%
                        </span>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

            {/* CVR CHART */}

            <div className="chart-card">

              <div className="chart-card-header">

                <div>

                  <h3>
                    CVR by Creative
                  </h3>

                  <p>
                    Conversion rate comparison
                  </p>

                </div>

              </div>

              <div className="bar-chart">

                {campaignData.map(
                  (item, index) => {

                    const value =
                      Number(item.cvr) || 0;

                    return (

                      <div
                        className="bar-row"
                        key={index}
                      >

                        <span className="bar-label">
                          {item.creative}
                        </span>

                        <div className="bar-track">

                          <div
                            className="bar-fill"
                            style={{
                              width: `${Math.min(
                                value * 10,
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                        <span className="bar-value">
                          {value.toFixed(2)}%
                        </span>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =================================
          AI INSIGHT PREVIEW
      ================================== */}

      <div
        className="analytics-insight"
        onClick={() => {
          window.location.href = "/insights";
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            window.location.href =
              "/insights";
          }

        }}
      >

        <div className="insight-symbol">
          ✦
        </div>

        <div>

          <p className="page-label">
            AI ANALYSIS
          </p>

          <h2>
            Connect performance with visual
            creative signals
          </h2>

          <p>
            Once campaign data is connected with
            your analyzed creatives, InsightForge
            can identify patterns between visual
            characteristics and campaign metrics.
          </p>

        </div>

        <div className="insight-arrow">
          →
        </div>

      </div>

    </div>
  );
}

export default CampaignAnalytics;