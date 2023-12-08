export const comparePriority = (a, b) => {
    if (a.priority && b.priority) {
        return a.priority - b.priority;
    }
    return null
}