export const LLMMultiWheelToolResult = {
    step_1: {
        dataSourceStep: 0,
        result:
        {
            sort: [
                [1], [2]
            ],
            answerSort: {
                A1: [
                    [2], [1]
                ],

                A2: [
                    [1], [2]
                ]
            },
            textAttribute: [{
                isLaText: true,
                max: 22,
                min: 1,
                textId: "Ok",
                tip: "提示语",
                title: "标题",
                value: " $$\\frac{a}{b}$$ "
            }],
            modelData: [
                {
                    id: 1,
                    sort: [],
                    answerList: [
                        {
                            id: 'A1',
                            answer: '金百味1',
                        },
                        {
                            id: 'A2',
                            answer: '全刀手1',
                        },
                    ],
                },
                {
                    id: 2,
                    sort: [],
                    answerList: [
                        {
                            id: 'A1',
                            answer: '金百味',
                        },
                        {
                            id: 'A2',
                            answer: '全刀手',
                        },
                    ],
                },
            ],
        },
        toolName: 'LLMMultiWheelTool',
    },
};

export const LLMMultiWheelToolQa = [
    {
        id: 1,
        question: '今天晚上吃什么？',
        name: 'Orl_answer',
        answerList: [
            {
                id: 'A1',
                answer: '金百味1',
            },
            {
                id: 'A2',
                answer: '全刀手1',
            },
        ],
    },
    {
        id: 2,
        question: '明天中午吃什么？',
        name: 'GPT_answer',
        answerList: [
            {
                id: 'A1',
                answer: '金百味',
            },
            {
                id: 'A2',
                answer: '全刀手',
            },
        ],
    },
];
