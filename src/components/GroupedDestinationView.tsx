import type { DestinationGroup } from "../domain/DeliveryLeg";
import { formatBoxes } from "../domain/groupDeliveryLegs";

interface GroupedDestinationViewProps {
  groups: DestinationGroup[];
}

export function GroupedDestinationView({ groups }: GroupedDestinationViewProps) {
  const manifestTotalScu = groups.reduce(
    (total, group) => total + group.totalScu,
    0,
  );

  return (
    <section className="card">
      <h2>Manifest: <strong>{manifestTotalScu} SCU</strong></h2>

      {groups.length === 0 ? (
        <p>No destination groups yet.</p>
      ) : (
        <div className="groups">
          {groups.map((group) => {
            let runningTotalScu = 0;

            return (
              <article className="group" key={group.destination}>
                <h3>
                  {group.destination} — {group.totalScu} SCU
                </h3>

                <ul className="manifest">
                  {group.cargoLines.map((line) => {
                    runningTotalScu += line.totalScu;

                    return (
                      <li
                        key={`${line.pickup}-${line.destination}-${line.commodity}`}
                      >
                        <strong>
                          {line.totalScu} SCU {line.commodity}
                        </strong>{" "}
                        from {line.pickup}{" "}
                        <span className="muted">
                         ({runningTotalScu} SCU total)
                        </span>
                        <br />
                        <span className="muted">
                          Boxes: {formatBoxes(line.boxes)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}