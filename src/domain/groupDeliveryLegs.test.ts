import { describe, expect, test } from "vitest";
import {
  breakScuIntoFewestBoxes,
  groupDeliveryLegsByDestination,
} from "./groupDeliveryLegs";
import type { BoxSize, DeliveryLeg } from "./DeliveryLeg";

function makeLeg(
  destination: string,
  commodity: string,
  totalScu: number,
  maxBoxSize: BoxSize = 32,
): DeliveryLeg {
  return {
    id: crypto.randomUUID(),
    pickup: "Port Tressler",
    destination,
    commodity,
    totalScu,
    maxBoxSize,
    createdAt: new Date().toISOString(),
  };
}

describe("breakScuIntoFewestBoxes", () => {
  test("breaks SCU into the fewest boxes using largest allowed boxes first", () => {
    expect(breakScuIntoFewestBoxes(9)).toEqual([
      { size: 8, count: 1 },
      { size: 1, count: 1 },
    ]);

    expect(breakScuIntoFewestBoxes(9, 4)).toEqual([
      { size: 4, count: 2 },
      { size: 1, count: 1 },
    ]);

    expect(breakScuIntoFewestBoxes(48, 24)).toEqual([
      { size: 24, count: 2 },
    ]);
  });
});

describe("groupDeliveryLegsByDestination", () => {
  test("groups cargo by destination and commodity", () => {
    const groups = groupDeliveryLegsByDestination([
      makeLeg("Sakura Sun Goldenrod Workcenter", "Aluminum", 3),
      makeLeg("Sakura Sun Goldenrod Workcenter", "Stims", 2),
      makeLeg("NB International Spaceport", "Aluminum", 8),
      makeLeg("NB International Spaceport", "Stims", 9, 4),
    ]);

    expect(groups).toHaveLength(2);

    const nbis = groups.find(
      (group) => group.destination === "NB International Spaceport",
    );

    expect(nbis?.cargoLines).toContainEqual({
      pickup: "Port Tressler",
      destination: "NB International Spaceport",
      commodity: "Stims",
      boxes: [
        { size: 4, count: 2 },
        { size: 1, count: 1 },
      ],
      totalScu: 9,
    });
  });

  test("merges boxes from separate delivery legs without recomputing the aggregate", () => {
    const groups = groupDeliveryLegsByDestination([
      makeLeg("NB International Spaceport", "Stims", 9, 4),
      makeLeg("NB International Spaceport", "Stims", 9, 4),
    ]);

    expect(groups[0].cargoLines[0]).toEqual({
      pickup: "Port Tressler",
      destination: "NB International Spaceport",
      commodity: "Stims",
      boxes: [
        { size: 4, count: 4 },
        { size: 1, count: 2 },
      ],
      totalScu: 18,
    });
  });
});