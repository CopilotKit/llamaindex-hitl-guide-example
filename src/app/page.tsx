"use client";

import { useState } from "react";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { Markdown } from "@copilotkit/react-ui"
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";

export default function CopilotKitPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  // 🪁 Frontend Actions: https://docs.copilotkit.ai/guides/frontend-actions
  useCopilotAction({
    name: "change_theme_color",
    parameters: [{
      name: "theme_color",
      description: "The theme color to set. Make sure to pick nice colors.",
      required: true, 
    }],
    handler({ theme_color }) {
      setThemeColor(theme_color);
    },
  });

  

  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}>
      <YourMainContent themeColor={themeColor} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "Popup Assistant",
          initial: "👋 Hi! This agent can draft essays with a Human-in-the-Loop review.\n\nTry asking: \"Write an essay about the future of AI.\"\nIt will generate a draft for you to review in the chat.\n- Click **Approve Draft** to save it below.\n- Click **Try Again** to request changes.\n\nAs you interact, the UI updates to reflect the agent's **state**, **tool calls**, and **progress**."
        }}
      />
    </main>
  );
}

// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  essay: string;
}

function YourMainContent({ themeColor }: { themeColor: string }) {
  // 🪁 Shared State: https://docs.copilotkit.ai/coagents/shared-state
  const {state, setState} = useCoAgent<AgentState>({
    name: "sample_agent",
    initialState: {
      essay: "",
    },
  })

  // 🪁 HITL Essay Action: updates shared state on approval
  useCopilotAction({
    name: "write_essay",
    available: "remote",
    description: "Writes an essay and takes the draft as an argument.",
    parameters: [
      { name: "draft", type: "string", description: "The draft of the essay", required: true },
    ],
    followUp: false,
    renderAndWaitForResponse: ({ args, respond, status }) => {
      return (
        <div className="text-(--copilot-kit-secondary-contrast-color)">
          <Markdown content={args.draft || 'Preparing your draft...'} />
          <div className={`flex gap-4 pt-4 ${status !== "executing" ? "hidden" : ""}`}>
            <button
              onClick={() => respond?.("CANCEL")}
              disabled={status !== "executing"}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-900/5 text-gray-500 p-2 rounded-xl w-full transition-colors duration-300 ease-out"
            >
              Ignore Draft
            </button>
            <button
              onClick={() => {
                setState({
                  ...state,
                  essay: args.draft || "",
                });
                respond?.("SEND");
              }}
              disabled={status !== "executing"}
              className="bg-blue-500 hover:bg-blue-600 border border-gray-900/5 text-white p-2 rounded-xl w-full transition-colors duration-300 ease-out"
            >
              Accept Draft
            </button>
          </div>
        </div>
      );
    },
  });

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300 ease-out"
    >
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Essay</h1>
        <p className="text-gray-200 text-center italic mb-6">Ask the assistant to draft an essay, then approve it to save below.</p>
        <hr className="border-white/20 my-6" />
        <div className="bg-white/10 p-4 rounded-xl text-white">
          {state.essay ? (
            <Markdown content={state.essay} />
          ) : (
            <p className="text-white/80 italic">No essay yet. Ask the assistant to write one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
