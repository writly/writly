# Writly

`writly` is a library that offers a beautiful markdown editor. [Try it out yourself!](https://www.writ.ly)

**Note: `writly` a prototype that is currently in development.**

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

## Contributing

`writly` is built upon facebook's [`lexical`](https://github.com/facebook/lexical), a plugin-based platform. You are welcome to contribute useful plugins to enhance `writly`!

## License

`writly` is licensed under the MIT License.
