import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { isNumber } from 'lodash';

import { DexieModule } from './custom-modules/DexieModule';
// import { AdvertModule } from './custom-modules/AdvertModule';
// import { ExternalInputModule } from './custom-modules/ExternalInputModule';

import zhCNLang from 'langs/zh-cn.json';
import { Message } from '@arco-design/web-react';
import { convertExpressionByRule, simpleExecExpression } from './utils';

/**
 * default options
 */
// Tabulator.defaultOptions.columnDefaults.headerSort = false;

/**
 * register modules
 */
Tabulator.registerModule(DexieModule);

// Tabulator.registerModule(ExternalInputModule);
// Tabulator.registerModule(AdvertModule);
/**
 * extending modules
 */

// extendiing formatter
Tabulator.extendModule('format', 'formatters', {
  delRowIcon: function () {
    // const curRow = cell.getRow();
    return `<span class="tabulator-row-del-icon" style="cursor: pointer; color: #666;">
      <svg data-action="del-row-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 48 48" aria-hidden="true" focusable="false" stroke-linecap="butt" stroke-linejoin="miter" class="arco-icon arco-icon-close-circle" style="font-size: 24px;"><path d="m17.643 17.643 6.364 6.364m0 0 6.364 6.364m-6.364-6.364 6.364-6.364m-6.364 6.364-6.364 6.364M42 24c0 9.941-8.059 18-18 18S6 33.941 6 24 14.059 6 24 6s18 8.059 18 18Z"></path>
      </svg>
    </span>`; //make the contents of the cell bold
  },
  placeholder: function (cell, formatterParams, _onRendered) {
    const cellValue = cell.getValue();
    const { placeholder, color = ' #A9AEB8' } = formatterParams || {};

    if (cellValue) return cellValue;

    if (placeholder)
      return `<span style="color: ${color}">${placeholder}</span>`;

    return '';
  },
  // tickbox: function (_cell: CellComponent, _formatterParams, _onRendered) {
  //   // cell.getColumn().getDefinition().cellClick = function (e, cell) {
  //   //   // e.stopPropagation();
  //   //   cell.getRow().toggleSelect();
  //   // };
  //   return `<input type="checkbox" aria-label="Select Row" data-action="tickbox">`;
  // },
});

// extending accessors
Tabulator.extendModule('accessor', 'accessors', {
  roundDown: function (value, data, accessorParams) {
    return Math.floor(value); //return the new value for the cell data.
  },
});

// extending requests
// Tabulator.extendModule("ajax", "defaultConfig", {
//   type: "POST",
//   contentType : "application/json; charset=utf-8",

// });

// extending Column Calculation

// extending edit
Tabulator.extendModule('edit', 'editors', {
  uppercaseInput: function (cell, onRendered, success, cancel, editorParams) {
    //create and style input
    const cellValue = cell.getValue().toUpperCase();
    const input = document.createElement('input');

    input.setAttribute('type', 'text');

    input.style.padding = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';

    input.value = cellValue;

    onRendered(function () {
      input.focus();
      input.style.height = '100%';
    });

    function onChange(e) {
      if (input.value !== cellValue) {
        success(input.value.toUpperCase());
      } else {
        cancel();
      }
    }

    //submit new value on blur or change
    input.addEventListener('change', onChange);
    input.addEventListener('blur', onChange);

    //submit new value on enter
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        success(input.value);
      }

      if (e.key === 'Escape') {
        cancel();
      }
    });

    return input;
  },
});

// extending localization
Tabulator.extendModule('localize', 'langs', {
  zh: zhCNLang,
});

// extending mutators
Tabulator.extendModule('mutator', 'mutators', {
  mathCalc: function (_value, data, _type, mutatorParams) {
    /**
     * NOTE: defining the calculate rules, for example: `([columnName] + [columnName]) * [columnName]`
     */
    const {
      calcRule = '',
      // ellipsisType = 'round',
      precision,
      defaultValue = {},
    } = mutatorParams || {};
    try {
      const convertCalcRules: string = convertExpressionByRule(
        calcRule,
        data,
        true,
        defaultValue
      );
      console.log('convertCalcRules', convertCalcRules);
      if (convertCalcRules.includes('NaN')) return;

      const result = simpleExecExpression(convertCalcRules)();

      if (isNumber(precision) && precision > 0) {
        return result.toFixed(precision);
      }

      return result;
    } catch (e) {
      console.error('mutator - mathCalc failed: ', e?.message);
      Message.info('定义的列计算规则格式不正确');
    }
  },
});

export default Tabulator;

// extending validate data
