/**
 * @file Latex config
 * Markdown renders introverted formulas by default('\\textstyle').
 * If special formulas need to be displayed up and down, you need to add '\\displaystyle'
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2023-11-28
 */

const common = {
  key: 'commonSymbols',
  label: 'CommonSymbols',

  children: [
    {
      key: 'binaryOperator',
      label: 'BinaryOperations',
      children: [
        { key: '+', remark: '' },
        { key: '-' },
        { key: '\\times' },
        { key: '{\\div}' },
        { key: '\\pm' },
        { key: '\\mp' },
        { key: '\\triangleleft' },
        { key: '\\triangleright' },
        { key: '\\cdot' },
        { key: '\\setminus' },
        { key: '\\star' },
        { key: '\\ast' },
        { key: '\\cup' },
        { key: '\\cap' },
        { key: '\\sqcup' },
        { key: '\\sqcap' },
        { key: '\\vee' },
        { key: '\\wedge' },
        { key: '\\circ' },
        { key: '\\bullet' },
        { key: '\\oplus' },
        { key: '\\ominus' },
        { key: '\\odot' },
        { key: '\\oslash' },
        { key: '\\otimes' },
        { key: '\\bigcirc' },
        { key: '\\diamond' },
        { key: '\\uplus' },
        { key: '\\bigtriangleup' },
        { key: '\\bigtriangledown' },
        { key: '\\lhd' },
        { key: '\\rhd' },
        { key: '\\unlhd' },
        { key: '\\unrhd' },
        { key: '\\amalg' },
        { key: '\\wr' },
        { key: '\\dagger' },
        { key: '\\ddagger' },
      ],
    },
    {
      key: 'binaryRelation',
      label: 'BinaryRelations',
      children: [
        { key: '<' },
        { key: '>' },
        { key: '=' },
        { key: '\\le' },
        { key: '\\ge' },
        { key: '\\equiv' },
        { key: '\\ll' },
        { key: '\\gg' },
        { key: '\\doteq' },
        { key: '\\prec' },
        { key: '\\succ' },
        { key: '\\sim' },
        { key: '\\preceq' },
        { key: '\\succeq' },
        { key: '\\simeq' },
        { key: '\\approx' },
        { key: '\\subset' },
        { key: '\\supset' },
        { key: '\\subseteq' },
        { key: '\\supseteq' },
        { key: '\\sqsubset' },
        { key: '\\sqsupset' },
        { key: '\\sqsubseteq' },
        { key: '\\sqsupseteq' },
        { key: '\\cong' },
        { key: '\\Join' },
        { key: '\\bowtie' },
        { key: '\\propto' },
        { key: '\\in' },
        { key: '\\ni' },
        { key: '\\vdash' },
        { key: '\\dashv' },
        { key: '\\models' },
        { key: '\\mid' },
        { key: '\\parallel' },
        { key: '\\perp' },
        { key: '\\smile' },
        { key: '\\frown' },
        { key: '\\asymp' },
        { key: ':' },
        { key: '\\notin' },
        { key: '\\ne' },
      ],
    },
    {
      key: 'arrowSymbol',
      label: 'Arrows',
      children: [
        { key: '\\gets' },
        { key: '\\to' },
        { key: '\\longleftarrow' },
        { key: '\\longrightarrow' },
        { key: '\\uparrow' },
        { key: '\\downarrow' },
        { key: '\\updownarrow' },
        { key: '\\leftrightarrow' },
        { key: '\\Uparrow' },
        { key: '\\Downarrow' },
        { key: '\\Updownarrow' },
        { key: '\\longleftrightarrow' },
        { key: '\\Leftarrow' },
        { key: '\\Longleftarrow' },
        { key: '\\Rightarrow' },
        { key: '\\Longrightarrow' },
        { key: '\\Leftrightarrow' },
        { key: '\\Longleftrightarrow' },
        { key: '\\mapsto' },
        { key: '\\longmapsto' },
        { key: '\\nearrow' },
        { key: '\\searrow' },
        { key: '\\swarrow' },
        { key: '\\nwarrow' },
        { key: '\\hookleftarrow' },
        { key: '\\hookrightarrow' },
        { key: '\\rightleftharpoons' },
        { key: '\\iff' },
        { key: '\\leftharpoonup' },
        { key: '\\rightharpoonup' },
        { key: '\\leftharpoondown' },
        { key: '\\rightharpoondown' },
      ],
    },
    {
      key: 'otherSymbol',
      label: 'Others',
      children: [
        { key: '\\because' },
        { key: '\\therefore' },
        { key: '\\dots' },
        { key: '\\cdots' },
        { key: '\\vdots' },
        { key: '\\ddots' },
        { key: '\\forall' },
        { key: '\\exists' },
        { key: '\\nexists' },
        { key: '\\Finv' },
        { key: '\\neg' },
        { key: '\\prime' },
        { key: '\\emptyset' },
        { key: '\\infty' },
        { key: '\\nabla' },
        { key: '\\triangle' },
        { key: '\\Box' },
        { key: '\\Diamond' },
        { key: '\\bot' },
        { key: '\\top' },
        { key: '\\angle' },
        { key: '\\measuredangle' },
        { key: '\\sphericalangle' },
        { key: '\\surd' },
        { key: '\\diamondsuit' },
        { key: '\\heartsuit' },
        { key: '\\clubsuit' },
        { key: '\\spadesuit' },
        { key: '\\flat' },
        { key: '\\natural' },
        { key: '\\sharp' },
      ],
    },
  ],
};

const greek = {
  key: 'greek',
  label: 'Greek',
  children: [
    {
      key: 'lower',
      label: 'Lowercase',
      children: [
        { key: '\\alpha' },
        { key: '\\beta' },
        { key: '\\gamma' },
        { key: '\\delta' },
        { key: '\\epsilon' },
        { key: '\\varepsilon' },
        { key: '\\zeta' },
        { key: '\\eta' },
        { key: '\\theta' },
        { key: '\\vartheta' },
        { key: '\\iota' },
        { key: '\\kappa' },
        { key: '\\lambda' },
        { key: '\\mu' },
        { key: '\\nu' },
        { key: '\\xi' },
        { key: 'o' },
        { key: '\\pi' },
        { key: '\\varpi' },
        { key: '\\rho' },
        { key: '\\varrho' },
        { key: '\\sigma' },
        { key: '\\varsigma' },
        { key: '\\tau' },
        { key: '\\upsilon' },
        { key: '\\phi' },
        { key: '\\varphi' },
        { key: '\\chi' },
        { key: '\\psi' },
        { key: '\\omega' },
      ],
    },
    {
      key: 'uppercase',
      label: 'Uppercase',
      children: [
        { key: '\\Gamma' },
        { key: '\\Delta' },
        { key: '\\Theta' },
        { key: '\\Lambda' },
        { key: '\\Xi' },
        { key: '\\Pi' },
        { key: '\\Sigma' },
        { key: '\\Upsilon' },
        { key: '\\Phi' },
        { key: '\\Psi' },
        { key: '\\Omega' },
      ],
    },
  ],
};

const advancedMathematics = {
  key: 'advancedMathematics',
  label: 'AdvancedMathematics',
  children: [
    {
      key: 'fractionalDifferentiation',
      label: 'FractionalDifferentiation',
      children: [
        {
          key: 'fraction',
          label: 'Fraction',
          children: [
            { key: '\\frac{a}{b}' },
            { key: '\\tfrac{a}{b}' },
            { key: '\\mathrm{d}t' },
            { key: '\\frac{\\mathrm{d}y}{\\mathrm{d}x}' },
            { key: '\\partial t' },
            { key: '\\frac{\\partial y}{\\partial x}' },
            { key: '\\nabla\\psi' },
            { key: '\\frac{\\partial^2}{\\partial x_1\\partial x_2}y' },
          ],
        },
        {
          key: 'derivative',
          label: 'Derivative',
          children: [
            {
              key: '\\dot{a}',
            },
            {
              key: '\\ddot{a}',
            },
            {
              key: `{f}'`,
            },
            {
              key: `{f}''`,
            },
            {
              key: '{f}^{(n)}',
            },
          ],
        },
        {
          key: 'modularArithmetic',
          label: 'ModularArithmetic',
          children: [
            {
              key: 'a \\bmod b',
            },
            {
              key: 'a \\equiv b \\pmod{m}',
            },
            {
              key: '\\gcd(m, n)',
            },
            {
              key: '\\operatorname{lcm}(m, n)',
            },
          ],
        },
      ],
    },
    {
      key: 'radical',
      label: 'Radical',
      children: [
        {
          key: 'radicalItem',
          label: 'Radical',
          children: [{ key: '\\sqrt{x}' }, { key: '\\sqrt[n]{x}' }],
        },
        {
          key: 'mark',
          label: 'SupAndSub',
          children: [
            {
              key: 'x^{a}',
            },
            {
              key: 'x_{a}',
            },
            {
              key: 'x_{a}^{b}',
            },
          ],
        },
      ],
    },
    {
      key: 'limitLogarithm',
      label: 'LimitLogarithm',
      children: [
        {
          key: 'limits',
          label: 'Limits',
          children: [
            { key: '\\lim a' },
            { key: '\\displaystyle \\lim_{x \\to 0}' },
            { key: '\\lim_{x \\to \\infty}' },
            { key: '\\textstyle \\lim_{x \\to 0}' },
            { key: '\\max_{}' },
            { key: '\\min_{}' },
          ],
        },
        {
          key: 'maLogarithmsAndExponentsrk',
          label: 'LogarithmsAndExponents',
          children: [
            { key: '\\log_{a}{b}' },
            { key: '\\lg_{a}{b}' },
            { key: '\\ln_{a}{b}' },
            { key: '\\exp a' },
          ],
        },
        {
          key: 'bounds',
          label: 'Bounds',
          children: [
            { key: '\\min x' },
            { key: '\\max y' },
            { key: '\\sup t' },
            { key: '\\inf s' },
            { key: '\\lim u' },
            { key: '\\limsup w' },
            { key: '\\liminf v' },
            { key: '\\dim p' },
            { key: '\\ker\\phi' },
          ],
        },
      ],
    },
    {
      key: 'integralOperation',
      label: 'IntegralOperation',
      children: [
        {
          key: 'integral',
          label: 'Integral',
          children: [{ key: '\\int' }, { key: '\\int_{a}^{b}' }, { key: '\\int\\limits_{a}^{b}' }],
        },
        {
          key: 'doubleIntegral',
          label: 'DoubleIntegral',
          children: [
            { key: '\\iint' },
            { key: '\\iint_{a}^{b}' },
            { key: '\\iint\\limits_{a}^{b}' },
          ],
        },
        {
          key: 'tripleIntegral',
          label: 'TripleIntegral',
          children: [
            { key: '\\iiint' },
            { key: '\\iiint_{a}^{b}' },
            { key: '\\iiint\\limits_{a}^{b}' },
          ],
        },
      ],
    },
    {
      key: 'largeOperations',
      label: 'LargeOperations',
      children: [
        {
          key: 'summation',
          label: '求和',
          children: [
            { key: '\\sum' },
            { key: '\\displaystyle \\sum_{a}^{b}' },
            { key: '{\\textstyle \\sum_{a}^{b}}' },
          ],
        },
        {
          key: 'productsAndCoproducts',
          label: 'ProductsAndCoproducts',
          children: [
            { key: '\\prod' },
            { key: '\\displaystyle \\prod_{a}^{b}' },
            { key: '{\\textstyle \\prod_{a}^{b}}' },
            { key: '\\coprod' },
            { key: '\\displaystyle \\coprod_{a}^{b}' },
            { key: '{\\textstyle \\coprod_{a}^{b}}' },
          ],
        },
        {
          key: 'intersectionAndUnion',
          label: 'IntersectionAndUnion',
          children: [
            { key: '\\bigcup' },
            { key: '\\displaystyle \\bigcup_{a}^{b}' },
            { key: '{\\textstyle \\bigcup_{a}^{b}}' },
            { key: '\\bigcap' },
            { key: '\\displaystyle \\bigcap_{a}^{b}' },
            { key: '{\\textstyle \\bigcap_{a}^{b}}' },
          ],
        },
      ],
    },
  ],
};

const linearAlgebra = {
  key: 'linearAlgebra',
  label: 'LinearAlgebra',
  children: [
    {
      key: 'bracketForensics',
      label: 'BracketForensics',
      children: [
        {
          key: 'bracket',
          label: 'Bracket',
          children: [
            { key: '\\left ( a \\right )' },
            { key: '\\left [ a \\right ]' },
            { key: '\\left \\langle a \\right \\rangle' },
            { key: '\\left \\{ a \\right \\}' },
            { key: '\\left | a \\right |' },
            { key: '\\left \\| a \\right \\|' },
          ],
        },
        {
          key: 'common',
          label: 'Common',
          children: [
            { key: '\\binom{n}{r}' },
            { key: '\\left [ 0,1 \\right )' },
            { key: '\\left \\langle \\psi \\right |' },
            { key: '\\left | \\psi \\right \\rangle' },
            { key: '\\left \\langle \\psi | \\psi \\right \\rangle' },
          ],
        },
      ],
    },
    {
      key: 'arrayMatrix',
      label: 'ArrayMatrix',
      children: [
        { key: '\\begin{matrix} 11& 11 &11 \\\\ 11& 11 &11 \\end{matrix}' },
        { key: '\\begin{bmatrix} 11 & 11\\\\ 11 & 11 \\end{bmatrix}' },
        { key: '\\begin{pmatrix} 11&  11& 11\\\\ 11&  11& 11 \\end{pmatrix}' },
        { key: '\\begin{vmatrix} 11& 11\\\\ 11&11 \\end{vmatrix}' },
        { key: '\\begin{Bmatrix} 11& 11\\\\ 11&11 \\end{Bmatrix}' },
      ],
    },
  ],
};

const trigonometric = {
  key: 'trigonometric',
  label: 'TrigonometricFunctions',
  children: [
    {
      key: 'trigonometricFunctions',
      label: 'TrigonometricFunctions',
      children: [
        { key: '\\sin\\alpha' },
        { key: '\\cos\\alpha' },
        { key: '\\tan\\alpha' },
        { key: '\\cot\\alpha' },
        { key: '\\sec\\alpha' },
        { key: '\\csc\\alpha' },
      ],
    },
    {
      key: 'inverseTrigonometricFunctions',
      label: 'InverseTrigonometricFunctions',
      children: [
        { key: '\\sin^{-1}\\alpha' },
        { key: '\\cos^{-1}\\alpha' },
        { key: '\\tan^{-1}\\alpha' },
        { key: '\\cot^{-1}\\alpha' },
        { key: '\\sec^{-1}\\alpha' },
        { key: '\\csc^{-1}\\alpha' },
        { key: '\\arcsin\\alpha' },
        { key: '\\arccos\\alpha' },
        { key: '\\arctan\\alpha' },
        { key: '\\operatorname{arccot}\\alpha' },
        { key: '\\operatorname{arccsc}\\alpha' },
      ],
    },
    {
      key: 'hyperblicFunctions',
      label: 'HyperblicFunctions',
      children: [
        { key: '\\sinh\\alpha' },
        { key: '\\cosh\\alpha' },
        { key: '\\tanh\\alpha' },
        { key: '\\coth\\alpha' },
        { key: '\\operatorname{sech}\\alpha' },
        { key: '\\operatorname{csch}\\alpha' },
      ],
    },
    {
      key: 'inverseHyperblicFunctions',
      label: 'InverseHyperblicFunctions',
      children: [
        { key: '\\sinh^{-1}\\alpha' },
        { key: '\\cosh^{-1}\\alpha' },
        { key: '\\tanh^{-1}\\alpha' },
        { key: '\\coth^{-1}\\alpha' },
        { key: '\\operatorname{sech}^{-1}\\alpha' },
        { key: '\\operatorname{csch}^{-1}\\alpha' },
      ],
    },
  ],
};

const formulaTemplate = {
  key: 'formulaTemplate',
  label: 'FormulaTemplate',
  children: [
    {
      key: 'algebraFormula',
      label: 'Algebra',
      children: [
        { key: '\\left(x-1\\right)\\left(x+3\\right)' },
        { key: '\\frac{a}{b}\\pm \\frac{c}{d}= \\frac{ad \\pm bc}{bd}' },
        { key: 'x ={-b \\pm \\sqrt{b^2-4ac}\\over 2a}' },
        {
          key: '\\left\\{\\begin{matrix} x=a + r\\text{cos}\\theta \\\\ y=b + r\\text{sin}\\theta \\end{matrix}\\right.',
        },
      ],
    },
    {
      key: 'geometryFormula',
      label: 'Geometry',
      children: [
        { key: '\\Delta ABC' },
        { key: 'a \\parallel c,b \\parallel c \\Rightarrow a \\parallel b' },
        {
          key: '\\left.\\begin{matrix} a \\perp \\alpha \\\\ b \\perp \\alpha \\end{matrix}\\right\\}\\Rightarrow a \\parallel b',
        },
        {
          key: '\\begin{array}{c} \\text{直角三角形中,直角边长a,b,斜边边长c} \\\\ a^{2}+b^{2}=c^{2} \\end{array}',
        },
      ],
    },
    {
      key: 'inequalityFormula',
      label: 'Inequality',
      children: [
        { key: 'a > b,b > c \\Rightarrow a > c' },
        { key: '\\left | a-b \\right | \\geqslant \\left | a \\right | -\\left | b \\right |' },
        { key: '-\\left | a \\right |\\leq a\\leqslant \\left | a \\right |' },
        {
          key: '\\begin{array}{c} a,b \\in \\mathbb{R}^{+} \\\\ \\Rightarrow \\frac{a+b}{{2}}\\ge \\sqrt{ab} \\\\ \\left( \\text{当且仅当}a=b\\text{时取“}=\\text{”号}\\right) \\end{array}',
        },
        {
          key: '\\begin{array}{c} a,b \\in \\mathbb{R} \\\\ \\Rightarrow a^{2}+b^{2}\\gt 2ab \\\\ \\left( \\text{当且仅当}a=b\\text{时取“}=\\text{”号}\\right) \\end{array}',
        },
      ],
    },
    {
      key: 'integralFormula',
      label: 'Integral',
      children: [
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}x^n=nx^{n-1}' },
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin x=\\cos x' },
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\cos x=-\\sin x' },
        { key: '\\int k\\mathrm{d}x = kx+C' },
      ],
    },
    {
      key: 'matrixFormula',
      label: 'Matrix',
      children: [
        { key: '\\begin{pmatrix}  1 & 0 \\\\  0 & 1\\end{pmatrix}' },
        {
          key: '\\begin{pmatrix}  a_{11} & a_{12} & a_{13} \\\\  a_{21} & a_{22} & a_{23} \\\\  a_{31} & a_{32} & a_{33}\\end{pmatrix}',
        },
        {
          key: 'A_{m\\times n}=\\begin{bmatrix}  a_{11}& a_{12}& \\cdots  & a_{1n} \\\\  a_{21}& a_{22}& \\cdots  & a_{2n} \\\\  \\vdots & \\vdots & \\ddots & \\vdots \\\\  a_{m1}& a_{m2}& \\cdots  & a_{mn}\\end{bmatrix}=\\left [ a_{ij}\\right ]',
        },
        {
          key: '\\mathbf{V}_1 \\times \\mathbf{V}_2 =\\begin{vmatrix}  \\mathbf{i}& \\mathbf{j}& \\mathbf{k} \\\\  \\frac{\\partial X}{\\partial u}& \\frac{\\partial Y}{\\partial u}& 0 \\\\  \\frac{\\partial X}{\\partial v}& \\frac{\\partial Y}{\\partial v}& 0 \\\\ \\end{vmatrix}',
        },
      ],
    },
    {
      key: 'triangleFormula',
      label: 'Triangle',
      children: [
        { key: 'e^{i \\theta}' },
        { key: '\\text{sin}^{2}\\frac{\\alpha}{2}=\\frac{1- \\text{cos}\\alpha}{2}' },
        {
          key: '\\sin \\alpha + \\sin \\beta =2 \\sin \\frac{\\alpha + \\beta}{2}\\cos \\frac{\\alpha - \\beta}{2}',
        },
        {
          key: '\\cos \\alpha + \\cos \\beta =2 \\cos \\frac{\\alpha + \\beta}{2}\\cos \\frac{\\alpha - \\beta}{2}',
        },
      ],
    },
    {
      key: 'statisticsFormula',
      label: 'Statistics',
      children: [
        { key: 'C_{r}^{n}' },
        { key: '\\sum_{i=1}^{n}{X_i}' },
        {
          key: '\\begin{array}{c} \\text{若}P \\left( AB \\right) =P \\left( A \\right) P \\left( B \\right) \\\\  \\text{则}P \\left( A \\left| B\\right. \\right) =P \\left({B}\\right) \\end{array}',
        },
        { key: 'P \\left( A \\right) = \\lim \\limits_{n \\to \\infty}f_{n}\\left ( A \\right )' },
      ],
    },
    {
      key: 'sequenceFormula',
      label: 'Sequence',
      children: [
        { key: 'a_{n}=a_{1}q^{n-1}' },
        { key: 'S_{n}=\\frac{n \\left( a_{1}+a_{n}\\right)}{2}' },
        { key: '\\frac{1}{4n^{2}-1}=\\frac{1}{2}\\left( \\frac{1}{2n-1}-\\frac{1}{2n+1}\\right)' },
        {
          key: '\\begin{array}{c} \\text{若}\\left \\{a_{n}\\right \\}、\\left \\{b_{n}\\right \\}\\text{为等差数列}, \\\\ \\text{则}\\left \\{a_{n}+ b_{n}\\right \\}\\text{为等差数列} \\end{array}',
        },
      ],
    },
    {
      key: 'physicsFormula',
      label: 'Physics',
      children: [
        {
          key: '\\sum \\vec{F}_i = \\frac{d\\vec{v}}{dt} = 0',
        },
        { key: '{E_p} = -\\frac{{GMm}}{r}' },
        { key: 'd \\vec{F}= Id \\vec{l} \\times \\vec{B}' },
        {
          key: '\\begin{array}{l}  \\nabla \\cdot \\mathbf{D} =\\rho _f \\\\  \\nabla \\cdot \\mathbf{B} = 0 \\\\  \\nabla \\times  \\mathbf{E} = -\\cfrac{\\partial \\mathbf{B}}{\\partial t }  \\\\  \\nabla \\times  \\mathbf{H} = \\mathbf{J}_f +  \\cfrac{\\partial \\mathbf{D}}{\\partial t }   \\end{array}',
        },
      ],
    },
  ],
};

export const latexList = [
  common,
  greek,
  advancedMathematics,
  linearAlgebra,
  trigonometric,
  formulaTemplate,
];
