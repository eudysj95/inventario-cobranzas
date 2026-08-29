import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabList, Tab, TabPanel } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Primitives/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "An accessible tab component with keyboard navigation. Uses compound components: TabList, Tab, TabPanel.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Profile</Tab>
        <Tab>Settings</Tab>
        <Tab>Billing</Tab>
      </TabList>
      <TabPanel>
        <h3>Profile</h3>
        <p>Profile content goes here.</p>
      </TabPanel>
      <TabPanel>
        <h3>Settings</h3>
        <p>Settings content goes here.</p>
      </TabPanel>
      <TabPanel>
        <h3>Billing</h3>
        <p>Billing content goes here.</p>
      </TabPanel>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultIndex={0}>
      <TabList>
        <Tab>Active Tab</Tab>
        <Tab disabled>Disabled Tab</Tab>
        <Tab>Another Tab</Tab>
      </TabList>
      <TabPanel>
        <p>Active tab content</p>
      </TabPanel>
      <TabPanel>
        <p>Disabled tab content</p>
      </TabPanel>
      <TabPanel>
        <p>Another tab content</p>
      </TabPanel>
    </Tabs>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [index, setIndex] = React.useState(0);
    return (
      <div>
        <div className="mb-2 text-sm text-text-secondary">
          Current index: {index}
        </div>
        <Tabs index={index} onChange={setIndex}>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
            <Tab>Tab 3</Tab>
          </TabList>
          <TabPanel><p>Content 1</p></TabPanel>
          <TabPanel><p>Content 2</p></TabPanel>
          <TabPanel><p>Content 3</p></TabPanel>
        </Tabs>
      </div>
    );
  },
};

import React from "react";