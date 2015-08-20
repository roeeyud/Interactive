var adminAppModule = angular.module('noviSudokuTable', []);

function getColRow(index) {
    return {
        col: index % 9,
        row: Math.floor(index / 9)
    };
}

adminAppModule.directive('sudokuTable', function () {
    return {
        restrict: 'C',
        scope: {
            sudokuEngine: '=',
            userProgressMatrix: '=',
            role: '=',
            updateScreen: '=',
            playerProgress: '='
        },
        templateUrl: 'files/templates/sudoku-table.html',
        controller: function ($scope) {

        },
        link: function (scope, elem, attrs) {
            var selectedCell = -1;

            function createInnerRow(rowInOuterTable, innerTableIndex, innerRowIndex) {
                var $innerRow = $('<tr></tr>'),
                    cellId;

                for(var i = 0; i < 3; i++) {
                    var $newCell;
                    cellId = (rowInOuterTable * 27) + (innerRowIndex * 9) + innerTableIndex * 3 + i;
                    if (scope.role === 'screen') {
                        $newCell = $('<td class="sudoku-cell prog-0" id="sudoku-cell-' + cellId + '"><span></span></td>');
                    } else {
                        $newCell = $('<td class="sudoku-cell" id="sudoku-cell-' + cellId + '"><span></span></td>');
                    }

                    $innerRow.append($newCell);
                }

                return $innerRow;
            }

            function updateCellProgress(index, val, oldVal) {
                var $target = $('#sudoku-cell-' + index);

                $target.removeClass('prog-0');

                $target.addClass('prog-' + val);

                if (oldVal !== undefined) {
                    $target.removeClass('prog-' + oldVal);
                }

            }

            scope.$watchCollection('playerProgress', function (playerProgress, oldPlayerProgress) {
                var isOldValid = Array.isArray(oldPlayerProgress);
                if (!Array.isArray(playerProgress)) {
                    return;
                }
                playerProgress.forEach(function (val, index) {
                    if (!isOldValid || val !== oldPlayerProgress[index]) {
                        updateCellProgress(index, val, oldPlayerProgress[index]);
                    }
                });
            });

            function createInnerTable(rowInOuterTable, innerTableIndex) {
                var $innerTable = $('<td class="outer"><table class="inner"><tbody></tbody></table></td>'),
                    $targetElement = $innerTable.find('tbody');

                for(var i = 0; i < 3; i++) {
                    $targetElement.append(createInnerRow(rowInOuterTable, innerTableIndex, i));
                }

                return $innerTable;
            }

            function createMatrixRow(row) {
                var $row = $('<tr></tr>');

                for(var i = 0; i < 3; i++) {
                    $row.append(createInnerTable(row, i));
                }

                return $row;
            }

            function createMatrixElements() {
                var $target = elem.find('table'),
                    $body = $('<tbody class="sudoku-body"></tbody>');
                for(var i = 0; i < 3; i++) {
                    $body.append(createMatrixRow(i));
                }

                $target.append($body);
            }

            function resetTable() {
                var target = elem.find('.sudoku-body');
                if (target.length)
                    target.remove();

                createMatrixElements();
            }

            function testBackgrounds() {
                for (var i = 0; i < 16; i++) {
                    var $target = $('#sudoku-cell-' + i);
                    $target.removeClass('prog-0')
                    $target.removeClass('hint');
                    $target.addClass('prog-' + i);
                }
            }
            scope.$watch('sudokuEngine.matrix', function (matrix) {
                resetTable();
            });

            function selectCell (cellElem) {
                selectedCell = Number(cellElem.id.replace('sudoku-cell-', ''));
                highlightNumber(scope.sudokuEngine.matrix[selectedCell]);

                if ($(cellElem).hasClass('hint')) {
                    selectedCell = -1;
                    return;
                }

                elem.find('.selected-cell').removeClass('selected-cell');
                $(cellElem).addClass('selected-cell');
            }

            function validateCell(number, cellIndex) {
                var colRow = getColRow(cellIndex),
                    res = scope.sudokuEngine.checkVal(colRow.row, colRow.col, number);

                if (res) {
                    $('#sudoku-cell-' + cellIndex).removeClass('invalid');
                } else {
                    $('#sudoku-cell-' + cellIndex).addClass('invalid');
                }

                return res;
            }

            function validateNumber(number) {
                scope.sudokuEngine.matrix.forEach(function (cellValue, index) {
                    if (cellValue === number) {
                        elem.find('#sudoku-cell-' + index).removeClass('invalid');
                        validateCell(number, index);
                    }
                });
            }

            function highlightCell(cellIndex) {
                $('#sudoku-cell-' + cellIndex).addClass('highLight');
            }

            function highlightNumber(number) {
                if (number <= 0) {
                    return;
                }

                $('.highLight').removeClass('highLight');

                scope.sudokuEngine.matrix.forEach(function (cellValue, index) {
                    if (cellValue === number) {
                        highlightCell(index);
                    }
                });
            }

            if (scope.role === 'user') {


                scope.onNumberClick = function (number) {
                    if (selectedCell >= 0) {
                        var $target = $('#sudoku-cell-' + selectedCell + ' span'),
                            lastValue = scope.sudokuEngine.matrix[selectedCell],
                            validInput = validateCell(number, selectedCell);


                        $target.text(number);
                        scope.sudokuEngine.matrix[selectedCell] = number;
                        validateNumber(lastValue);
                        validateNumber(number);
                        highlightNumber(number);

                        if (validInput) {
                            scope.updateScreen();
                        }
                    }
                }

                scope.onDeleteClick = function () {
                    if (selectedCell >= 0) {
                        var $target = $('#sudoku-cell-' + selectedCell + ' span'),
                            lastValue = scope.sudokuEngine.matrix[selectedCell];

                        scope.sudokuEngine.matrix[selectedCell] = 0;
                        validateNumber(lastValue);
                        $target.text('');
                        scope.updateScreen();
                    }
                }

                function bindUserEvents() {
                    elem.on('click', '.sudoku-cell' , function () {
                        selectCell(this);
                    })

                    $(window.document.body).on('keypress', function (event) {
                        if(event.which >= 49 && event.which <= 57) {
                            var num = event.which - 48;
                            scope.onNumberClick(num);
                        }

                        if (event.which === 48) {
                            scope.onDeleteClick();
                        }
                    })
                }

                bindUserEvents();

            }

        }
    }
});