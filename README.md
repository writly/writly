# Writly

`writly` is a library that offers a markdown WYSIWYG editor as a react component. It's built upon facebook's `lexical` and `lexical-playground` to ensure performant rich text editing. [Try it out yourself!](https://www.writ.ly)


## Installation

```bash
npm install writly
```

## Usage

```jsx
import { Writly } from "writly";
import "writly/writly.css";

export default function App() {
  return (
    <div style={{ width: "650px" }}>
      <Writly />
    </div>
  );
}
```

If you need to access the underlying `LexicalEditor` instance, you can pass a reference to `Writly`.

```jsx
import { Writly } from "writly";
import "writly/writly.css";
import React from "react";

export default function App() {
  const ref = useRef();
  return (
    <div style={{ width: "650px" }}>
      <Writly ref={ref} />
    </div>
  );
}
```

## Development

Feel free to add any useful `lexical` plugins!

1. Clone the repository

2. Install dependencies:

- `npm install`

3. Start the local Storybook server:

- `npm run storybook`

## License

`writly` is licensed under the MIT License.
