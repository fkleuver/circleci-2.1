(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@au-test/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@au-test/kernel");
    exports.INode = kernel_1.DI.createInterface().noDefault();
    exports.IRenderLocation = kernel_1.DI.createInterface().noDefault();
    /*@internal*/
    function createNodeSequenceFromFragment(fragment) {
        return new FragmentNodeSequence(fragment.cloneNode(true));
    }
    exports.createNodeSequenceFromFragment = createNodeSequenceFromFragment;
    // pre-declare certain functions whose behavior depends on a once-checked global condition for better performance
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function removeNormal(node) {
        node.remove();
    }
    function removePolyfilled(node) {
        // not sure if we still actually need this, this used to be an IE9/10 thing
        node.parentNode.removeChild(node);
    }
    exports.DOM = {
        createFactoryFromMarkupOrNode(markupOrNode) {
            let template;
            if (markupOrNode instanceof Node) {
                if (markupOrNode.content) {
                    template = markupOrNode;
                }
                else {
                    template = exports.DOM.createTemplate();
                    template.content.appendChild(markupOrNode);
                }
            }
            else {
                template = exports.DOM.createTemplate();
                template.innerHTML = markupOrNode;
            }
            // bind performs a bit better and gives a cleaner closure than an arrow function
            return createNodeSequenceFromFragment.bind(null, template.content);
        },
        createElement(name) {
            return document.createElement(name);
        },
        createText(text) {
            return document.createTextNode(text);
        },
        createNodeObserver(target, callback, options) {
            const observer = new MutationObserver(callback);
            observer.observe(target, options);
            return observer;
        },
        attachShadow(host, options) {
            return host.attachShadow(options);
        },
        /*@internal*/
        createTemplate() {
            return document.createElement('template');
        },
        cloneNode(node, deep) {
            return node.cloneNode(deep !== false); // use true unless the caller explicitly passes in false
        },
        migrateChildNodes(currentParent, newParent) {
            const append = exports.DOM.appendChild;
            while (currentParent.firstChild) {
                append(newParent, currentParent.firstChild);
            }
        },
        isNodeInstance(potentialNode) {
            return potentialNode instanceof Node;
        },
        isElementNodeType(node) {
            return node.nodeType === 1;
        },
        isTextNodeType(node) {
            return node.nodeType === 3;
        },
        remove(node) {
            // only check the prototype once and then permanently set a polyfilled or non-polyfilled call to save a few cycles
            if (Element.prototype.remove === undefined) {
                (exports.DOM.remove = removePolyfilled)(node);
            }
            else {
                (exports.DOM.remove = removeNormal)(node);
            }
        },
        replaceNode(newChild, oldChild) {
            if (oldChild.parentNode) {
                oldChild.parentNode.replaceChild(newChild, oldChild);
            }
        },
        appendChild(parent, child) {
            parent.appendChild(child);
        },
        insertBefore(nodeToInsert, referenceNode) {
            referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
        },
        getAttribute(node, name) {
            return node.getAttribute(name);
        },
        setAttribute(node, name, value) {
            node.setAttribute(name, value);
        },
        removeAttribute(node, name) {
            node.removeAttribute(name);
        },
        hasClass(node, className) {
            return node.classList.contains(className);
        },
        addClass(node, className) {
            node.classList.add(className);
        },
        removeClass(node, className) {
            node.classList.remove(className);
        },
        addEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).addEventListener(eventName, subscriber, options);
        },
        removeEventListener(eventName, subscriber, publisher, options) {
            (publisher || document).removeEventListener(eventName, subscriber, options);
        },
        isAllWhitespace(node) {
            if (node.auInterpolationTarget === true) {
                return false;
            }
            const text = node.textContent;
            const len = text.length;
            let i = 0;
            // for perf benchmark of this compared to the regex method: http://jsben.ch/p70q2 (also a general case against using regex)
            while (i < len) {
                // charCodes 0-0x20(32) can all be considered whitespace (non-whitespace chars in this range don't have a visual representation anyway)
                if (text.charCodeAt(i) > 0x20) {
                    return false;
                }
                i++;
            }
            return true;
        },
        treatAsNonWhitespace(node) {
            // see isAllWhitespace above
            node.auInterpolationTarget = true;
        },
        convertToRenderLocation(node) {
            const location = document.createComment('au-loc');
            // let this throw if node does not have a parent
            node.parentNode.replaceChild(location, node);
            return location;
        },
        registerElementResolver(container, resolver) {
            container.registerResolver(exports.INode, resolver);
            container.registerResolver(Element, resolver);
            container.registerResolver(HTMLElement, resolver);
            container.registerResolver(SVGElement, resolver);
        }
    };
    // This is an implementation of INodeSequence that represents "no DOM" to render.
    // It's used in various places to avoid null and to encode
    // the explicit idea of "no view".
    const emptySequence = {
        firstChild: null,
        lastChild: null,
        childNodes: kernel_1.PLATFORM.emptyArray,
        findTargets() { return kernel_1.PLATFORM.emptyArray; },
        insertBefore(refNode) { },
        appendTo(parent) { },
        remove() { }
    };
    exports.NodeSequence = {
        empty: emptySequence
    };
    // This is the most common form of INodeSequence.
    // Every custom element or template controller whose node sequence is based on an HTML template
    // has an instance of this under the hood. Anyone who wants to create a node sequence from
    // a string of markup would also receive an instance of this.
    // CompiledTemplates create instances of FragmentNodeSequence.
    /*@internal*/
    class FragmentNodeSequence {
        constructor(fragment) {
            this.fragment = fragment;
            this.firstChild = fragment.firstChild;
            this.lastChild = fragment.lastChild;
            this.childNodes = kernel_1.PLATFORM.toArray(fragment.childNodes);
        }
        findTargets() {
            return this.fragment.querySelectorAll('.au');
        }
        insertBefore(refNode) {
            refNode.parentNode.insertBefore(this.fragment, refNode);
        }
        appendTo(parent) {
            parent.appendChild(this.fragment);
        }
        remove() {
            const fragment = this.fragment;
            let current = this.firstChild;
            if (current.parentNode !== fragment) {
                // this bind is a small perf tweak to minimize member accessors
                const append = fragment.appendChild.bind(fragment);
                const end = this.lastChild;
                let next;
                while (current) {
                    next = current.nextSibling;
                    append(current);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
        }
    }
    exports.FragmentNodeSequence = FragmentNodeSequence;
});
//# sourceMappingURL=dom.js.map