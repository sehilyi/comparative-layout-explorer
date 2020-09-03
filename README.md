# Comparative Layout Explorer
An online gallery to explore the design space of comparative layouts using on a flexible declaratie grammar built based on a literature survey.

citation:
> **Sehi L'Yi**, Jaemin Jo, and Jinwook Seo, Comparative Layouts Revisited: Design Space, Guidelines, and Future Directions, IEEE Transactions on Visualization and Computer Graphics (TVCG), 2020, (Proc. InfoVis 2020). [[arXiv](https://arxiv.org/abs/2009.00192)]


![screenshot](https://user-images.githubusercontent.com/9922882/72881001-4b151f00-3d43-11ea-943e-f8b530a709f7.png)


## Conceptual Framework
### Layouts
```javascript
Layout := Unit, Type, Arrangement, Mirrored
Type := Juxtaposition | Superposition | Explicit-Encoding
Unit := Chart | Item
Arrangement := Adjacent | Stacked | Diagonal | Animated
Mirrored := True | False

```

## Development

Install Yarn from https://yarnpkg.com/lang/en/.

Clone the repo:

```bash
git clone git@github.com:sehilyi/comparative-layout-explorer.git
cd comparative-layout-explorer
```

Install the dependencies:

```bash
yarn install
```

Start the test server:

```bash
yarn start
```
