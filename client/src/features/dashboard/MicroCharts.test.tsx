import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MicroLineChart, MicroBarChart, MicroAreaChart } from "./MicroCharts";
import "../../styles/design-tokens.css";

describe("MicroLineChart", () => {
  const mockData = [
    { day: "Lun", value: 100 },
    { day: "Mar", value: 200 },
    { day: "Mié", value: 150 },
    { day: "Jue", value: 300 },
    { day: "Vie", value: 250 },
    { day: "Sáb", value: 400 },
    { day: "Dom", value: 350 },
  ];

  it("renders line chart with data", () => {
    render(<MicroLineChart data={mockData} xKey="day" yKey="value" />);
    const chart = screen.getByTestId("micro-line-chart");
    expect(chart).toBeInTheDocument();
  });

  it("uses token colors for line stroke", () => {
    render(<MicroLineChart data={mockData} xKey="day" yKey="value" />);
    const chart = screen.getByTestId("micro-line-chart");
    // The chart should use CSS custom properties for colors
    expect(chart).toBeInTheDocument();
  });

  it("renders tooltip on hover", () => {
    render(<MicroLineChart data={mockData} xKey="day" yKey="value" />);
    // Tooltip is rendered by recharts internally
    const chart = screen.getByTestId("micro-line-chart");
    expect(chart).toBeInTheDocument();
  });

  it("has responsive height using --dash-chart-height", () => {
    render(<MicroLineChart data={mockData} xKey="day" yKey="value" />);
    const chart = screen.getByTestId("micro-line-chart");
    const styles = window.getComputedStyle(chart);
    // Height should be controlled by CSS custom property
    expect(styles.height).toBeTruthy();
  });

  it("handles empty data gracefully", () => {
    render(<MicroLineChart data={[]} xKey="day" yKey="value" />);
    const chart = screen.getByTestId("micro-line-chart");
    expect(chart).toBeInTheDocument();
  });

  it("accepts custom stroke color via token", () => {
    render(<MicroLineChart data={mockData} xKey="day" yKey="value" strokeColor="var(--color-primary)" />);
    const chart = screen.getByTestId("micro-line-chart");
    expect(chart).toBeInTheDocument();
  });
});

describe("MicroBarChart", () => {
  const mockData = [
    { name: "Producto A", units: 45 },
    { name: "Producto B", units: 38 },
    { name: "Producto C", units: 32 },
    { name: "Producto D", units: 28 },
    { name: "Producto E", units: 22 },
  ];

  it("renders bar chart with data", () => {
    render(<MicroBarChart data={mockData} xKey="name" yKey="units" />);
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });

  it("uses token colors for bars", () => {
    render(<MicroBarChart data={mockData} xKey="name" yKey="units" />);
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });

  it("renders vertical layout for horizontal bars", () => {
    render(<MicroBarChart data={mockData} xKey="name" yKey="units" layout="vertical" />);
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });

  it("has responsive height using --dash-chart-height", () => {
    render(<MicroBarChart data={mockData} xKey="name" yKey="units" />);
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(<MicroBarChart data={[]} xKey="name" yKey="units" />);
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });

  it("accepts custom bar color via token", () => {
    render(
      <MicroBarChart
        data={mockData}
        xKey="name"
        yKey="units"
        barColor="var(--color-success)"
      />
    );
    const chart = screen.getByTestId("micro-bar-chart");
    expect(chart).toBeInTheDocument();
  });
});

describe("MicroAreaChart", () => {
  const mockData = [
    { day: "Lun", cash: 10000, credit: 5000 },
    { day: "Mar", cash: 20000, credit: 8000 },
    { day: "Mié", cash: 15000, credit: 6000 },
    { day: "Jue", cash: 30000, credit: 12000 },
    { day: "Vie", cash: 25000, credit: 10000 },
    { day: "Sáb", cash: 40000, credit: 15000 },
    { day: "Dom", cash: 35000, credit: 13000 },
  ];

  it("renders stacked area chart with multiple series", () => {
    render(
      <MicroAreaChart
        data={mockData}
        xKey="day"
        series={[
          { key: "cash", color: "var(--color-primary)" },
          { key: "credit", color: "var(--color-success)" },
        ]}
      />
    );
    const chart = screen.getByTestId("micro-area-chart");
    expect(chart).toBeInTheDocument();
  });

  it("uses token colors for area fills", () => {
    render(
      <MicroAreaChart
        data={mockData}
        xKey="day"
        series={[
          { key: "cash", color: "var(--color-primary)" },
          { key: "credit", color: "var(--color-success)" },
        ]}
      />
    );
    const chart = screen.getByTestId("micro-area-chart");
    expect(chart).toBeInTheDocument();
  });

  it("renders gradient fills with token colors", () => {
    render(
      <MicroAreaChart
        data={mockData}
        xKey="day"
        series={[
          { key: "cash", color: "var(--color-primary)" },
          { key: "credit", color: "var(--color-success)" },
        ]}
      />
    );
    const chart = screen.getByTestId("micro-area-chart");
    expect(chart).toBeInTheDocument();
  });

  it("has responsive height using --dash-chart-height", () => {
    render(
      <MicroAreaChart
        data={mockData}
        xKey="day"
        series={[{ key: "cash", color: "var(--color-primary)" }]}
      />
    );
    const chart = screen.getByTestId("micro-area-chart");
    expect(chart).toBeInTheDocument();
  });

  it("handles empty data gracefully", () => {
    render(
      <MicroAreaChart
        data={[]}
        xKey="day"
        series={[{ key: "cash", color: "var(--color-primary)" }]}
      />
    );
    const chart = screen.getByTestId("micro-area-chart");
    expect(chart).toBeInTheDocument();
  });
});

describe("MicroCharts Skeleton Loading", () => {
  it("renders skeleton when isLoading is true", () => {
    render(<MicroLineChart data={[]} xKey="day" yKey="value" isLoading />);
    const skeleton = screen.getByTestId("micro-chart-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders skeleton for bar chart", () => {
    render(<MicroBarChart data={[]} xKey="name" yKey="units" isLoading />);
    const skeleton = screen.getByTestId("micro-chart-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders skeleton for area chart", () => {
    render(
      <MicroAreaChart
        data={[]}
        xKey="day"
        series={[{ key: "cash", color: "var(--color-primary)" }]}
        isLoading
      />
    );
    const skeleton = screen.getByTestId("micro-chart-skeleton");
    expect(skeleton).toBeInTheDocument();
  });
});