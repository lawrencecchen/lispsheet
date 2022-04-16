import {
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  For,
  onMount,
  untrack,
} from "solid-js";

const LispInGrid = () => {
  const [width, setWidth] = createSignal(10);
  const [height, setHeight] = createSignal(10);

  const [cells, setCells] = createSignal(
    Array(width() * height())
      .fill("")
      .map((_, i) => {
        const [rawText, setRawText] = createSignal("");
        const isFormula = createMemo(() => rawText().startsWith("="));
        const [value, setValue] = createSignal("");
        const [formula, setFormula] = createSignal("");
        const [ref, setRef] = createSignal<HTMLInputElement>();

        createEffect(() => {
          if (rawText().startsWith("=")) {
            setFormula(rawText().replace("=", ""));
          } else {
            setValue(rawText());
          }
        });

        return {
          rawText,
          setRawText,
          setValue,
          value,
          isFormula,
          formula,
          ref,
          setRef,
          id: String(i),
          dependencies: new Set(),
          references: new Set(),
        };
      })
  );
  const [code, setCode] = createSignal(`(fn fib [n]
    (if (< n 2)
     n
     (+ (fib (- n 1)) (fib (- n 2)))))
   `);
  let replInstance;

  onMount(() => {
    replInstance = new Worker(
      // @ts-ignore
      new URL("/repl-worker.js", import.meta.url)
    );

    replInstance.onerror = (e) => {
      console.error(e);
    };
    replInstance.onmessage = (e) => {
      console.log(e.data);
      if (e.data.startsWith("calc")) {
        const [_, cellId, value] = e.data.split("|");
        const cell = cells()?.[+cellId];
        if (cell) {
          cell.setValue(value);
        }
      }
    };
  });

  function run(cell: string | number, formula: string) {
    replInstance.postMessage([cell, formula]);
  }

  function getId(address: string) {
    const col = address.match(/[A-Z]+/)?.[0].charCodeAt(0) - 65;
    const row = parseInt(address.match(/[0-9]+/)?.[0]) - 1;
    const id = col + row * width();
    return id;
  }

  return (
    <>
      <div class="">
        <div class="flex">
          <div
            class="grid border-b transform -translate-y-px border-gray-300"
            style={{
              "grid-template-columns": `46px`,

              "grid-template-rows": `repeat(${height() + 1}, 24px)`,
            }}
          >
            <div></div>
            <For each={Array(height())}>
              {(_, i) => (
                <div class="text-center text-xs uppercase text-gray-500 flex items-center justify-center border-t border-gray-300 bg-gray-50">
                  {i() + 1}
                </div>
              )}
            </For>
          </div>
          <div class="overflow-x-auto border-l border-gray-300">
            <div
              class="grid h-6 border-gray-300"
              style={{
                "grid-template-columns": `repeat(${width()}, 100px)`,
              }}
            >
              <For each={Array(width())}>
                {(_, i) => (
                  <div class="text-center text-xs uppercase text-gray-500 flex items-center justify-center border border-l-0 border-gray-300 bg-gray-50 ">
                    {String.fromCharCode(i() + 65)}
                  </div>
                )}
              </For>
            </div>
            <div
              class="grid border-gray-300"
              style={{
                "grid-template-columns": `repeat(${width()}, 100px)`,
                "grid-template-rows": `repeat(${height()}, 24px)`,
              }}
            >
              <For each={cells()}>
                {(cell) => {
                  const [selected, setSelected] = createSignal(false);
                  const [editing, setEditing] = createSignal(false);

                  createEffect(() => {
                    if (editing()) {
                      if (cell.isFormula()) {
                        cell.setValue(cell.rawText());
                      }
                    }
                  });
                  function focus() {
                    setSelected(true);
                  }

                  let dispose;
                  function recalculate() {
                    dispose?.();
                    if (cell.isFormula()) {
                      // dispose = createRoot(() => {
                      const refAddresses = cell
                        .formula()
                        .match(/[a-zA-Z]+\d+/gm);
                      if (refAddresses) {
                        let newFormula = cell.formula();
                        for (const refAddress of refAddresses) {
                          const refId = getId(refAddress);
                          const refCell = cells()[refId];

                          if (refCell) {
                            createEffect((prev) => {
                              if (refCell.value() && !!prev) {
                                console.log("dependency changed");
                                untrack(recalculate);
                              }
                              return true;
                            });
                          }
                          newFormula = newFormula.replaceAll(
                            refAddress,
                            (Number.isInteger(parseInt(refCell.value()))
                              ? refCell.value()
                              : `"${refCell.value()}"`) ?? "0"
                          );
                        }
                        console.log(newFormula);
                        run(cell.id, code() + " " + newFormula);
                      } else {
                        run(cell.id, code() + " " + cell.formula());
                      }
                      // });
                    } else {
                      dispose?.();
                    }
                  }

                  function blur() {
                    setSelected(false);
                    setEditing(false);
                    recalculate();
                  }

                  let inputRef: HTMLInputElement;

                  function keydown(e: KeyboardEvent) {
                    if (e.key === "Enter") {
                      if (!editing()) {
                        setEditing(true);
                      } else {
                        setEditing(false);
                        recalculate();
                      }
                    } else if (e.key === "=") {
                      setEditing(true);
                    } else if (!editing() && e.key === "i") {
                      e.preventDefault();
                      setEditing(true);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditing(false);
                      setSelected(false);
                      recalculate();
                      cell.ref().focus();
                    } else if (!editing() && e.key === "Backspace") {
                      cell.setValue("");
                    }
                    if (!editing()) {
                      if (e.key === "ArrowUp" || e.key === "k") {
                        const topCell = cells()?.[parseInt(cell.id) - width()];
                        topCell?.ref()?.focus();
                      } else if (e.key === "ArrowDown" || e.key === "j") {
                        const bottomCell =
                          cells()?.[parseInt(cell.id) + width()];
                        bottomCell?.ref()?.focus();
                      } else if (e.key === "ArrowLeft" || e.key === "h") {
                        e.preventDefault();
                        if (parseInt(cell.id) % width() === 0) {
                          return;
                        }
                        const leftCell = cells()?.[parseInt(cell.id) - 1];
                        leftCell?.ref()?.focus();
                      } else if (e.key === "ArrowRight" || e.key === "l") {
                        e.preventDefault();
                        if (parseInt(cell.id) % width() === width() - 1) {
                          return;
                        }
                        const rightCell = cells()?.[parseInt(cell.id) + 1];
                        rightCell?.ref()?.focus();
                      }
                    }
                  }

                  onMount(() => {
                    cell.setRef(inputRef);
                  });

                  return (
                    <input
                      ref={inputRef}
                      type="text"
                      class="border-b border-r border-gray-300 text-xs pl-1 pr-0 focus:outline-none focus:ring-0 focus:border-gray-300 focus:bg-gray-100"
                      value={cell.value()}
                      onInput={(e) => cell.setRawText(e.currentTarget.value)}
                      onFocus={focus}
                      onDblClick={() => setEditing(true)}
                      onBlur={blur}
                      onKeyDown={keydown}
                      readOnly={!editing()}
                    />
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </div>
      <div class="p-2">
        <div class="">Custom Functions</div>
        <div class="">
          <textarea
            value={code()}
            onInput={(e) => setCode(e.currentTarget.value)}
            cols="50"
            rows="10"
            class="border"
          ></textarea>
        </div>
      </div>
    </>
  );
};
export default LispInGrid;
