const getParentElement = (element) => element.parentElement || element.getRootNode().host || null;
const getElementRect = (element) => {
    const rect = element.getBoundingClientRect();
    const scaleX = ('offsetWidth' in element &&
        Math.abs(rect.width) / element.offsetWidth) ||
        1;
    const scaleY = ('offsetHeight' in element &&
        Math.abs(rect.height) / element.offsetHeight) ||
        1;
    return {
        top: rect.top,
        right: rect.left + element.clientWidth * scaleX,
        bottom: rect.top + element.clientHeight * scaleY,
        left: rect.left,
    };
};
const paddingValueToInt = (value) => {
    const number = parseInt(value, 10);
    return Number.isNaN(number) ? 0 : number;
};
// Follow the steps described in https://www.w3.org/TR/cssom-view-1/#element-scrolling-members,
// assuming that the scroll option is set to 'nearest'.
const getScrollDistance = (targetStart, targetEnd, scrollStart, scrollEnd, scrollPaddingStart, scrollPaddingEnd) => {
    if (targetStart < scrollStart && targetEnd > scrollEnd) {
        return 0;
    }
    if (targetStart < scrollStart) {
        return -(scrollStart - targetStart + scrollPaddingStart);
    }
    if (targetEnd > scrollEnd) {
        return targetEnd - targetStart > scrollEnd - scrollStart
            ? targetStart + scrollPaddingStart - scrollStart
            : targetEnd - scrollEnd + scrollPaddingEnd;
    }
    return 0;
};
const scrollRectIntoView = (root, targetRect) => {
    var _a, _b, _c, _d, _e;
    const document = root.ownerDocument;
    let rect = targetRect;
    let current = root;
    while (current) {
        const isDocumentBody = current === document.body;
        const bounding = isDocumentBody
            ? {
                top: 0,
                right: (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : document.documentElement.clientWidth,
                bottom: (_d = (_c = window.visualViewport) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : document.documentElement.clientHeight,
                left: 0,
            }
            : getElementRect(current);
        const style = getComputedStyle(current);
        const scrollDistanceX = getScrollDistance(rect.left, rect.right, bounding.left, bounding.right, paddingValueToInt(style.scrollPaddingLeft), paddingValueToInt(style.scrollPaddingRight));
        const scrollDistanceY = getScrollDistance(rect.top, rect.bottom, bounding.top, bounding.bottom, paddingValueToInt(style.scrollPaddingTop), paddingValueToInt(style.scrollPaddingBottom));
        if (scrollDistanceX || scrollDistanceY) {
            if (isDocumentBody) {
                (_e = document.defaultView) === null || _e === void 0 ? void 0 : _e.scrollBy(scrollDistanceX, scrollDistanceY);
            }
            else {
                const { scrollLeft, scrollTop } = current;
                if (scrollDistanceY) {
                    current.scrollTop += scrollDistanceY;
                }
                if (scrollDistanceX) {
                    current.scrollLeft += scrollDistanceX;
                }
                const scrolledLeft = current.scrollLeft - scrollLeft;
                const scrolledTop = current.scrollTop - scrollTop;
                rect = {
                    left: rect.left - scrolledLeft,
                    top: rect.top - scrolledTop,
                    right: rect.right - scrolledLeft,
                    bottom: rect.bottom - scrolledTop,
                };
            }
        }
        current =
            isDocumentBody || style.position === 'fixed'
                ? null
                : getParentElement(current);
    }
};
export default scrollRectIntoView;
//# sourceMappingURL=scrollRectIntoView.js.map