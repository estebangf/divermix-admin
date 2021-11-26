function descendingComparator(a: any, b: any, orderBy: keyof any) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export default function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  // a: { [key in Key]: string | undefined | number | Timestamp },
  // b: { [key in Key]: string | undefined | number | Timestamp },
    a: any,
    b: any,
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export type Order = 'asc' | 'desc';

// How to use:
// array.slice().sort(getComparator(order, orderBy))

