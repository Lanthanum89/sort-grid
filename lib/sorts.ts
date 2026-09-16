export type StepType = "compare" | "swap" | "current" | "sorted" | "start" | "done";

export type Step = {
  type: StepType;
  indices: number[];
  key: string;
  arr: number[];
  sortedSoFar: number[];
};

export type Algorithm = "bubble" | "insertion" | "selection" | "quick";

class Recorder {
  readonly arr: number[];
  readonly steps: Step[] = [];
  private readonly sorted = new Set<number>();

  constructor(values: number[]) {
    this.arr = [...values];
  }

  record(type: StepType, indices: number[], key: string) {
    this.steps.push({
      type,
      indices: [...indices],
      key,
      arr: [...this.arr],
      sortedSoFar: [...this.sorted],
    });
  }

  swap(a: number, b: number, key = "swap") {
    [this.arr[a], this.arr[b]] = [this.arr[b], this.arr[a]];
    this.record("swap", [a, b], key);
  }

  markSorted(index: number, key: string) {
    this.sorted.add(this.arr[index]);
    this.record("sorted", [index], key);
  }

  finish() {
    this.arr.forEach((value) => this.sorted.add(value));
    this.record("done", this.arr.map((_, index) => index), "done");
    return this.steps;
  }
}

function bubbleSort(values: number[]) {
  const r = new Recorder(values);
  r.record("start", [], "start");
  for (let end = r.arr.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      r.record("compare", [i, i + 1], "compare");
      if (r.arr[i] > r.arr[i + 1]) r.swap(i, i + 1);
    }
    r.markSorted(end, "passDone");
  }
  r.markSorted(0, "passDone");
  return r.finish();
}

function insertionSort(values: number[]) {
  const r = new Recorder(values);
  r.record("start", [], "start");
  for (let i = 1; i < r.arr.length; i++) {
    r.record("current", [i], "takeCurrent");
    let j = i;
    while (j > 0) {
      r.record("compare", [j - 1, j], "compare");
      if (r.arr[j - 1] <= r.arr[j]) break;
      r.swap(j - 1, j, "shift");
      j--;
    }
    r.record("current", [j], "insert");
  }
  return r.finish();
}

function selectionSort(values: number[]) {
  const r = new Recorder(values);
  r.record("start", [], "start");
  for (let i = 0; i < r.arr.length - 1; i++) {
    let min = i;
    r.record("current", [min], "setMin");
    for (let j = i + 1; j < r.arr.length; j++) {
      r.record("compare", [min, j], "compare");
      if (r.arr[j] < r.arr[min]) {
        min = j;
        r.record("current", [min], "newMin");
      }
    }
    if (min !== i) r.swap(i, min);
    r.markSorted(i, "passDone");
  }
  r.markSorted(r.arr.length - 1, "passDone");
  return r.finish();
}

function quickSort(values: number[]) {
  const r = new Recorder(values);
  r.record("start", [], "start");

  const partition = (low: number, high: number) => {
    const pivot = r.arr[high];
    r.record("current", [high], "pivot");
    let i = low - 1;
    for (let j = low; j < high; j++) {
      r.record("compare", [j, high], "compare");
      if (r.arr[j] <= pivot) {
        i++;
        if (i !== j) r.swap(i, j);
      }
    }
    if (i + 1 !== high) r.swap(i + 1, high, "pivotPlace");
    else r.record("current", [high], "pivotPlace");
    return i + 1;
  };

  const sort = (low: number, high: number) => {
    if (low > high) return;
    if (low === high) {
      r.markSorted(low, "baseCase");
      return;
    }
    const pivotIndex = partition(low, high);
    r.markSorted(pivotIndex, "pivotSorted");
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  };

  sort(0, r.arr.length - 1);
  return r.finish();
}

export const recordSort = (algorithm: Algorithm, values: number[]): Step[] => {
  switch (algorithm) {
    case "bubble": return bubbleSort(values);
    case "insertion": return insertionSort(values);
    case "selection": return selectionSort(values);
    case "quick": return quickSort(values);
  }
};

export const ALGORITHM_LABELS: Record<Algorithm, string> = {
  bubble: "Bubble",
  insertion: "Insertion",
  selection: "Selection",
  quick: "Quick",
};
