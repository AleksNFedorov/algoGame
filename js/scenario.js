var binarySearchScenarios = {
    scenarios: [
        {
            //9 elements
            _sequence: [1,2,3,4,5,6,7,8,9],
            _elementToFindIndex: 0,
            _steps: [
                {
                    startIndex: 0,
                    endIndex: 8,
                    elementIndex: 4,
                    isLast: false,
                    stepNumber: 0,
                    messageKeys: [
                        ["message1"],
                        ["message2"],
                    ],
                },
                {
                    startIndex: 0,
                    endIndex: 3,
                    elementIndex: 1,
                    isLast: false,
                    stepNumber: 1,
                    messageKeys: [
                        ["message3"],
                        ["message4"],
                    ],
                },
                {
                    startIndex: 0,
                    endIndex: 1,
                    elementIndex: 0,
                    isLast: true,
                    stepNumber: 2,
                    messageKeys: [
                        ["message5"],
                        ["message6"],
                    ],
                },
            ],
        },
        {
            //12 elements
            _sequence: [1,2,2,4,15,16,27,28,31,89,99,102],
            _elementToFindIndex: 7, //27
            _steps: [
                {
                    startIndex: 0,
                    endIndex: 11,
                    elementIndex: 5,
                    isLast: false,
                    stepNumber: 0,
                    messageKeys: [
                        ["message1"],
                        ["message2"],
                    ],
                },
                {
                    startIndex: 6,
                    endIndex: 11,
                    elementIndex: 8,
                    isLast: false,
                    stepNumber: 1,
                    messageKeys: [
                        ["message3"],
                        ["message4"],
                    ],
                },
                {
                    startIndex: 6,
                    endIndex: 7,
                    elementIndex: 6,
                    isLast: false,
                    stepNumber: 2,
                    messageKeys: [
                        ["message5"],
                        ["message6"],
                    ],
                },
                {
                    startIndex: 7,
                    endIndex: 7,
                    elementIndex: 7,
                    isLast: true,
                    stepNumber: 3,
                    messageKeys: [
                        ["message5"],
                        ["message6"],
                    ],
                },
            ],
        },
    ],
};