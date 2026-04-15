import Container from "../../imports/Container-2/Container-7-14";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <Container />
    </div>
  );
}
