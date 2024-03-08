# Writly

<br />

`writly` offers a user-friendly WYSIWYG markdown editor, simplifying the process of writing and collaborating.

**Note: `writly` a prototype that is currently in development and has not been tested for production use.**

## Installation

```bash
npm install writly
```

## Usage

```jsx
import { Writly } from "writly";
import "writly-/writly.css";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Writly />
    </div>
  );
}
```

## Contributing

`writly` is built upon [`lexical`](https://github.com/facebook/lexical), which is plugin-based. Feel free to contribute useful plugins to enhance `writly`!

## License

`writly` is licensed under the MIT License.
