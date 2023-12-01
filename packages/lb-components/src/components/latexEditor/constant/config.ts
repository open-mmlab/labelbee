/**
 * @file Latex config
 * Markdown renders introverted formulas by default('\\textstyle').
 * If special formulas need to be displayed up and down, you need to add '\\displaystyle'
 * @author lixinghua <lixinghua_vendor@sensetime.com>
 * @date 2023-11-28
 */

const common = {
  key: 'common',
  label: '常用符号',

  children: [
    {
      key: 'binaryOperator',
      label: '二元运算符',
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
      label: '二元关系符',
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
      label: '箭头符号',
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
      label: '其他符号',
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
  label: '希腊字母',
  children: [
    {
      key: 'lower',
      label: '小写',
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
      key: 'capital',
      label: '大写',
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

const higherMath = {
  key: 'higherMath',
  label: '高等数学',
  children: [
    {
      key: 'fractionalDifferentiation',
      label: '分数微分',
      children: [
        {
          key: 'fraction',
          label: '分数',
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
          label: '导数',
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
          label: '模算术',
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
      label: '根式',
      children: [
        {
          key: 'radicalItem',
          label: '根式',
          children: [{ key: '\\sqrt{x}' }, { key: '\\sqrt[n]{x}' }],
        },
        {
          key: 'mark',
          label: '上下标',
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
      label: '极限对数',
      children: [
        {
          key: 'limits',
          label: '极限',
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
          label: '对数指数',
          children: [
            { key: '\\log_{a}{b}' },
            { key: '\\lg_{a}{b}' },
            { key: '\\ln_{a}{b}' },
            { key: '\\exp a' },
          ],
        },
        {
          key: 'bounds',
          label: '界限',
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
      key: 'IntegralOperation',
      label: '积分运算',
      children: [
        {
          key: 'integral',
          label: '积分',
          children: [{ key: '\\int' }, { key: '\\int_{a}^{b}' }, { key: '\\int\\limits_{a}^{b}' }],
        },
        {
          key: 'doubleIntegral',
          label: '双重积分',
          children: [
            { key: '\\iint' },
            { key: '\\iint_{a}^{b}' },
            { key: '\\iint\\limits_{a}^{b}' },
          ],
        },
        {
          key: 'tripleIntegral',
          label: '三重积分',
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
      label: '大型运算',
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
          label: '乘积余积',
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
          label: '交集并集',
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
  label: '线性代数',
  children: [
    {
      key: 'bracketForensics',
      label: '括号取证',
      children: [
        {
          key: 'bracket',
          label: '括号',
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
          key: 'commons',
          label: '常用',
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
      label: '数组矩阵',
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
  label: '三角函数',
  children: [
    {
      key: 'trigonometricFunctions',
      label: '三角函数',
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
      label: '反三角函数',
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
      label: '双曲函数',
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
      label: '反双曲函数',
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
  label: '公式模板',
  children: [
    {
      key: 'algebraFormula',
      label: '代数',
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
      label: '几何',
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
      label: '不等式',
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
      label: '积分',
      children: [
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}x^n=nx^{n-1}' },
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\sin x=\\cos x' },
        { key: '\\frac{\\mathrm{d}}{\\mathrm{d}x}\\cos x=-\\sin x' },
        { key: '\\int k\\mathrm{d}x = kx+C' },
      ],
    },
    {
      key: 'matrixFormula',
      label: '矩阵',
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
      label: '三角',
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
      label: '统计',
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
      label: '数列',
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
      label: '物理',
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

export const latexList = [common, greek, higherMath, linearAlgebra, trigonometric, formulaTemplate];
