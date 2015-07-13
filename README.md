# words
A humble yet ambitious attempt to build a WYSIWYG editor, backed by JSON, without relying on document.execCommand

## Getting started

**1)** Pull down the repo

**2)** Pull down the dependencies

```
npm install
```

**3)** Start the server

```
node index.js
```

**4)** Load the page

```
http://localhost:8088/index.html
```

**5)** Dance, everybody dance

## Current JSON Tree Structure

The current strategy is to represent the state of the editor text via a tree object in JSON

### Document

A **Document** is the top level object and the root of the tree. It represents all of the text within the editor.  

**Document** objects have 2 main properties:

1. **blocks**
  * Array of all the **Block** objects which are its children.  These are loosely tied to block elements in that blocks are always separated by new lines.
2. **chars**
  * Array of all the **Char** objects within the entire editor.  These are the leaf-nodes of the data tree.

### Block

A **Block** is an object which represents a chunk of text which is separated by other chunks of text by new lines.

**Block** objects have 2 main properties:

1. **words**
  * Array of all the **Word** objects which are its children.
2. **parent**
  * A reference to its parent **Document** object.

### Word

A **Word** is an object which represents a chunk of text which is separated by other chunks of text by spaces (within the same **Block**).  All words will contain their ending character, which will either be:
  * A Space (' ')
  * A Newline ('\n')
  * An Empty String ('')
    * The last word in the **Document** will have this empty string as a terminator

**Word** objects have 2 main properties:

1. **chars**
  * Array of all the **Char** objects which are its children.
2. **parent**
  * A reference to its parent **Block** object.

### Char

A **Char** is an object which represents a single character of text. Currently, this will be where all formatting information will be stored (ie bold, italic, blockquote, etc.).

**Char** objects will represent every single character within a **Document**.  This includes spaces, newlines, and the empty character terminator.

**Char** objects have 3 main properties:

1. **char**
  * The character this represents
2. **props**
  * Key-Value pair representing a formatting property and whether it is applied (ie bold, italic, blockquote)
3. **parent**
  * A reference to its parent **Word** object.



