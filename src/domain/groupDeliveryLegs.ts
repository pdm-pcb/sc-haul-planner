import type {
  BoxSize,
  BoxStack,
  DeliveryLeg,
  DestinationCargoLine,
  DestinationGroup,
} from "./DeliveryLeg";

export const boxSizesDescending: BoxSize[] = [32, 24, 16, 8, 4, 2, 1];

export function breakScuIntoFewestBoxes(
  totalScu: number,
  maxBoxSize: BoxSize = 32,
): BoxStack[] {
  if (!Number.isInteger(totalScu) || totalScu <= 0) {
    return [];
  }

  const allowedBoxSizes = boxSizesDescending.filter(
    (size) => size <= maxBoxSize,
  );

  let remaining = totalScu;
  const boxes: BoxStack[] = [];

  for (const size of allowedBoxSizes) {
    const count = Math.floor(remaining / size);

    if (count > 0) {
      boxes.push({ size, count });
      remaining -= size * count;
    }
  }

  return boxes;
}

export function calculateTotalScu(boxes: BoxStack[]): number {
  return boxes.reduce((total, box) => total + box.size * box.count, 0);
}

function mergeBoxes(left: BoxStack[], right: BoxStack[]): BoxStack[] {
  const boxesBySize = new Map<BoxSize, number>();

  for (const box of [...left, ...right]) {
    boxesBySize.set(box.size, (boxesBySize.get(box.size) ?? 0) + box.count);
  }

  return [...boxesBySize.entries()]
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.size - a.size);
}

export function formatBoxes(boxes: BoxStack[]): string {
  return boxes
    .slice()
    .sort((a, b) => b.size - a.size)
    .map((box) => `${box.count}×${box.size} SCU`)
    .join(", ");
}

export function groupDeliveryLegsByDestination(
  legs: DeliveryLeg[],
): DestinationGroup[] {
  const groupsByDestination = new Map<string, DestinationGroup>();

  for (const leg of legs) {
    let destinationGroup = groupsByDestination.get(leg.destination);

    if (!destinationGroup) {
      destinationGroup = {
        destination: leg.destination,
        cargoLines: [],
        totalScu: 0,
      };

      groupsByDestination.set(leg.destination, destinationGroup);
    }

    const legBoxes = breakScuIntoFewestBoxes(leg.totalScu, leg.maxBoxSize);

    const existingLine = destinationGroup.cargoLines.find(
      (line) =>
        line.pickup === leg.pickup &&
        line.destination === leg.destination &&
        line.commodity.toLocaleLowerCase() === leg.commodity.toLocaleLowerCase(),
    );

    if (existingLine) {
      existingLine.boxes = mergeBoxes(existingLine.boxes, legBoxes);
      existingLine.totalScu += leg.totalScu;
    } else {
      const cargoLine: DestinationCargoLine = {
        pickup: leg.pickup,
        destination: leg.destination,
        commodity: leg.commodity,
        boxes: legBoxes,
        totalScu: leg.totalScu,
      };

      destinationGroup.cargoLines.push(cargoLine);
    }
  }

  for (const group of groupsByDestination.values()) {
    group.cargoLines.sort((a, b) => {
      const pickupCompare = a.pickup.localeCompare(b.pickup);
      if (pickupCompare !== 0) return pickupCompare;

      return a.commodity.localeCompare(b.commodity);
    });

    group.totalScu = group.cargoLines.reduce(
      (total, line) => total + line.totalScu,
      0,
    );
  }

  return [...groupsByDestination.values()].sort((a, b) =>
    a.destination.localeCompare(b.destination),
  );
}