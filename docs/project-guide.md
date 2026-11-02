# Adapt the project

## Understand the working example first

Start in mock mode. Read the variable, reset the counter, clear the chart, and watch the next event arrive. Observe that clearing the chart does not change the variable. Read [data flow](data-flow.md), then find the corresponding modules in your editor.

Use Git commits to save a working baseline and each meaningful change. Before asking an agent to implement, describe the physical behavior and what a person should see or control. Ask it to explain the affected files and how to test the result.

## Example: soil-moisture monitor

Write a small contract before changing code:

| Question             | Example decision                                             |
| -------------------- | ------------------------------------------------------------ |
| What is measured?    | Soil moisture, calibrated from 0–100%                        |
| Event name/data?     | `MoistureEvent`, JSON string containing `{ "moisture": 42 }` |
| Publishing interval? | Every 30 seconds, plus relevant state changes                |
| Variable?            | `moisture`, a numeric percentage                             |
| History?             | Numeric moisture and timestamps, scoped to the device        |
| Control?             | Begin with monitoring only; add watering separately          |

Then make one complete change across the layers:

1. Change the firmware to read/calibrate the sensor and publish the chosen payload.
2. Change `Reading` in `src/lib/types.ts` and `normalizeEvent` in `src/lib/server/readings.ts`. Parse JSON carefully and reject non-numeric/out-of-range values.
3. Update the MongoDB document mapping, mock device, REST variable parser, chart value and labels. Changing only the UI leaves the server contract inconsistent.
4. Change `.env.example` event/variable names. Update the payload documentation and tests.
5. Run mock mode first, then `npm run check`, `npm test`, `npm run build` and `npm run test:smoke`. Update counter-specific smoke assertions for your new contract.
6. Connect hardware and verify one reading through Particle Console, collector status, database and dashboard.

Existing counter documents do not automatically become moisture records. Use a new collection/database or explicitly plan a migration; never reinterpret unrelated old values silently.

## Work with an agent

Follow [agent setup](agentic-coding.md), then try:

> Use the add-iot-feature skill. Replace the counter example with the moisture contract above. Preserve server-only credentials, mock mode and single-instance collection. Explain the changes and how I can verify one reading end to end.

Useful follow-ups:

- “Explain why the variable card and latest-event card can show different values.”
- “Show what happens when the database is unavailable and how I can detect dropped readings.”
- “Help me add a firmware-enforced watering timeout before adding a public watering button.”

Never paste `.env`, tokens or database passwords into a prompt. Share variable names and sanitized diagnostics instead. Inspect the diff and ask the agent to explain code you do not understand. The goal is to build an application you can describe and demonstrate.

## Demonstrate your project

Explain the physical input, the event contract, the server validation, storage and dashboard behavior. Show one normal reading, an invalid-input case in tests, and what the app displays when the device is disconnected. State whether your hosting collects unattended and where gaps can occur.
