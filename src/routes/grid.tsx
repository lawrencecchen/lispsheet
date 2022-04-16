import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
} from "solid-js";

const Window = (props) => {
  return;
};

function createSize(ref: HTMLElement) {
  const [width, setWidth] = createSignal(0);
  const [height, setHeight] = createSignal(0);

  const onResize = () => {
    setWidth(ref.clientWidth);
    setHeight(ref.clientHeight);
  };

  onMount(() => {
    onResize();
    window.addEventListener("resize", onResize);
  });

  onCleanup(() => {
    window.removeEventListener("resize", onResize);
  });

  return {
    width,
    height,
  };
}

const columnsData = [
  "Icon",
  "Name",
  "Kingdom",
  "Phylum",
  "Class",
  "Order",
  "Family",
  "Genus",
  "Species",
];

const Grid = () => {
  const [widths, setWidths] = createSignal(Array(9).fill(100));
  const templateColumns = createMemo(() => widths().join("px ") + "px");
  const [data, setData] = createSignal([
    [
      "🐶",
      "Dog",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Canidae",
      "Canis",
      "C. familiaris",
    ],
    [
      "🐱",
      "Cat",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Felidae",
      "Felinae",
      "F. catus",
    ],
    [
      "🐭",
      "Mouse",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Rodentia",
      "Muridae",
      "Mus",
      "M. musculus",
    ],
    [
      "🐹",
      "Hamster",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Rodentia",
      "Cricetidae",
      "Mesocricetus",
      "M. auratus",
    ],
    [
      "🐰",
      "Rabbit",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Lagomorpha",
      "Leporidae",
      "Brachylagus",
      "B. idahoensis",
    ],
    [
      "🦊",
      "Fox",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Canidae",
      "Vulpes",
      "V. corsac",
    ],
    [
      "🐻",
      "Brown Bear",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Ursidae",
      "Ursus",
      "U. arctos",
    ],
    [
      "🐼",
      "Panda Bear",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Ursidae",
      "Ailuropoda",
      "A. melanoleuca",
    ],
    [
      "🐻‍❄️",
      "Polar Bear",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Ursidae",
      "Ursus",
      "U. maritimus",
    ],
    [
      "🐨",
      "Koala Bear",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Diprotodontia",
      "Phascolarctidae",
      "Phascolarctos",
      "P. cinereus",
    ],
    [
      "🐯",
      "Tiger",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Felidae",
      "Pantherinae",
      "P. tigris",
    ],
    [
      "🦁",
      "Lion",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Felidae",
      "Panthera",
      "P. leo",
    ],
    [
      "🐮",
      "Cow",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Artiodactyla",
      "Bovidae",
      "Bos",
      "B. taurus",
    ],
    [
      "🐷",
      "Pig",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Artiodactyla",
      "Suidae",
      "Sus",
      "S. domesticus",
    ],
    [
      "🐸",
      "Frog",
      "Animalia",
      "Chordata",
      "Amphibia",
      "Anura",
      "Ranidae",
      "Rana",
      "R. temporaria",
    ],
    [
      "🐵",
      "Chimpanzee",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Primates",
      "Hominidae",
      "Pan",
      "P. troglodytes",
    ],
    [
      "🐺",
      "Wolf",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Canidae",
      "Canis",
      "C. lupus",
    ],
    [
      "🦝",
      "Raccoon",
      "Animalia",
      "Chordata",
      "Mammalia",
      "Carnivora",
      "Procyonidae",
      "Procyon",
      "P. lotor",
    ],
    [
      "🐍",
      "Snake",
      "Animalia",
      "Chordata",
      "Reptilia",
      "Squamata",
      "Viperidae",
      "Vipera",
      "V. berus",
    ],
    [
      "🐞",
      "Ladybird",
      "Animalia",
      "Arthropoda",
      "Insecta",
      "Coleoptera",
      "Coccinellidae",
      "Coccinella",
      "C. magnifica",
    ],
    [
      "🦋",
      "Butterfly",
      "Animalia",
      "Arthropoda",
      "Insecta",
      "Lepidoptera",
      "Nymphalidae",
      "Vanessa",
      "V. cardui",
    ],
    [
      "🪲",
      "Beetle",
      "Animalia",
      "Arthropoda",
      "Insecta",
      "Coleoptera",
      "Lucanidae",
      "Dorcus",
      "D. parallelipipedus",
    ],
    [
      "🕷",
      "Spider",
      "Animalia",
      "Arthropoda",
      "Arachnida",
      "Araneae",
      "Theraphosidae",
      "Acanthopelma",
      "A. beccarii",
    ],
  ]);
  const [columns, setColumns] = createSignal(
    columnsData.map((name, i) => {
      const [width, setWidth] = createSignal(100);
      return {
        name,
        width,
        setWidth,
        accessor: (row: number) => data()[row][i],
      };
    })
  );

  return (
    <>
      <div className="flex">
        <For each={columns()}>
          {(col) => (
            <div class="flex flex-col" style={{ width: col.width() + "px" }}>
              <div>{col.name}</div>
              <div
                className="flex flex-col h-full overflow-hidden"
                style={{ "line-height": "24px" }}
              >
                <For each={Array(20)}>
                  {(_, i) => col.accessor(i()) + <>&#013;</>}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
      {/* <div
        class="grid text-sm"
        style={{
          "grid-template-columns": templateColumns(),
          "grid-template-rows": "24px",
        }}
      >
        <For each={data()}>
          {(row) => <For each={row}>{(cell) => <div>{cell}</div>}</For>}
        </For>
      </div> */}
    </>
  );
};
export default Grid;
