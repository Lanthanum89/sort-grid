import type { Algorithm } from "./sorts";

export type Language = "javascript" | "python" | "csharp";
export type LangEntry = { lines: string[]; keys: Record<string, number> };
export type Algo = Record<Language, LangEntry>;

const entry = (source: string, keys: Record<string, number>): LangEntry => {
  const lines = source.trim().split("\n");
  return { lines, keys: { ...keys, start: 0, done: lines.length - 1 } };
};

const bubble: Algo = {
  javascript: entry(`function bubbleSort(arr) {
  for (let end = arr.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
    // arr[end] is in its final position
  }
  return arr;
}`, { compare: 3, swap: 4, passDone: 7 }),
  python: entry(`def bubble_sort(arr):
    for end in range(len(arr) - 1, 0, -1):
        for i in range(end):
            if arr[i] > arr[i + 1]:
                arr[i], arr[i + 1] = arr[i + 1], arr[i]
        # arr[end] is in its final position
    return arr`, { compare: 3, swap: 4, passDone: 5 }),
  csharp: entry(`static int[] BubbleSort(int[] arr)
{
    for (int end = arr.Length - 1; end > 0; end--)
    {
        for (int i = 0; i < end; i++)
            if (arr[i] > arr[i + 1])
                (arr[i], arr[i + 1]) = (arr[i + 1], arr[i]);
        // arr[end] is in its final position
    }
    return arr;
}`, { compare: 5, swap: 6, passDone: 7 }),
};

const insertion: Algo = {
  javascript: entry(`function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      if (arr[j - 1] <= arr[j]) break;
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      j--;
    }
    // current value is now inserted
  }
  return arr;
}`, { takeCurrent: 2, compare: 4, shift: 5, swap: 5, insert: 8 }),
  python: entry(`def insertion_sort(arr):
    for i in range(1, len(arr)):
        j = i
        while j > 0:
            if arr[j - 1] <= arr[j]:
                break
            arr[j - 1], arr[j] = arr[j], arr[j - 1]
            j -= 1
        # current value is now inserted
    return arr`, { takeCurrent: 2, compare: 4, shift: 6, swap: 6, insert: 8 }),
  csharp: entry(`static int[] InsertionSort(int[] arr)
{
    for (int i = 1; i < arr.Length; i++)
    {
        int j = i;
        while (j > 0)
        {
            if (arr[j - 1] <= arr[j]) break;
            (arr[j - 1], arr[j]) = (arr[j], arr[j - 1]);
            j--;
        }
        // current value is now inserted
    }
    return arr;
}`, { takeCurrent: 4, compare: 7, shift: 8, swap: 8, insert: 11 }),
};

const selection: Algo = {
  javascript: entry(`function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) [arr[i], arr[min]] = [arr[min], arr[i]];
    // arr[i] is in its final position
  }
  return arr;
}`, { setMin: 2, compare: 4, newMin: 4, swap: 6, passDone: 7 }),
  python: entry(`def selection_sort(arr):
    for i in range(len(arr) - 1):
        min_index = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
        # arr[i] is in its final position
    return arr`, { setMin: 2, compare: 4, newMin: 5, swap: 7, passDone: 8 }),
  csharp: entry(`static int[] SelectionSort(int[] arr)
{
    for (int i = 0; i < arr.Length - 1; i++)
    {
        int min = i;
        for (int j = i + 1; j < arr.Length; j++)
            if (arr[j] < arr[min]) min = j;
        if (min != i) (arr[i], arr[min]) = (arr[min], arr[i]);
        // arr[i] is in its final position
    }
    return arr;
}`, { setMin: 4, compare: 6, newMin: 6, swap: 7, passDone: 8 }),
};

const quick: Algo = {
  javascript: entry(`function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return arr;
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  const p = i + 1;
  quickSort(arr, low, p - 1);
  quickSort(arr, p + 1, high);
  return arr;
}`, { baseCase: 1, pivot: 2, compare: 5, swap: 7, pivotPlace: 10, pivotSorted: 11 }),
  python: entry(`def quick_sort(arr, low=0, high=None):
    high = len(arr) - 1 if high is None else high
    if low >= high:
        return arr
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    p = i + 1
    quick_sort(arr, low, p - 1)
    quick_sort(arr, p + 1, high)
    return arr`, { baseCase: 2, pivot: 4, compare: 7, swap: 9, pivotPlace: 10, pivotSorted: 11 }),
  csharp: entry(`static void QuickSort(int[] arr, int low, int high)
{
    if (low >= high) return;
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++)
        if (arr[j] <= pivot)
        {
            i++;
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
    int p = i + 1;
    QuickSort(arr, low, p - 1);
    QuickSort(arr, p + 1, high);
}`, { baseCase: 2, pivot: 3, compare: 6, swap: 9, pivotPlace: 11, pivotSorted: 12 }),
};

export const CODE: Record<Algorithm, Algo> = { bubble, insertion, selection, quick };

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: "JavaScript",
  python: "Python",
  csharp: "C#",
};

export const SHIKI_LANG: Record<Language, string> = {
  javascript: "javascript",
  python: "python",
  csharp: "csharp",
};
