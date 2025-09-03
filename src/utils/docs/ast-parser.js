const fs = require('fs').promises;

let parser = null;

function initializeParser() {
    if (parser !== null) return parser;
    
    try {
        const { parse } = require('@babel/parser');
        parser = { parse, available: true };
        return parser;
    } catch (error) {
        parser = { available: false };
        return parser;
    }
}

class ASTParser {
    constructor() {
        this.parser = initializeParser();
    }

    async parseFile(filePath) {
        if (!this.parser.available) {
            return null;
        }

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const ast = this.parser.parse(content, {
                sourceType: 'module',
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true
            });

            return {
                exports: this.extractExports(ast),
                dependencies: this.extractDependencies(ast)
            };
        } catch (error) {
            return null;
        }
    }

    extractExports(ast) {
        const exports = [];
        
        for (const node of ast.body) {
            if (node.type === 'ExpressionStatement' && 
                node.expression?.type === 'AssignmentExpression' &&
                node.expression.left?.type === 'MemberExpression' &&
                node.expression.left.object?.name === 'module' &&
                node.expression.left.property?.name === 'exports') {
                
                if (node.expression.right.type === 'ObjectExpression') {
                    for (const prop of node.expression.right.properties) {
                        if (prop.key?.name) {
                            exports.push(prop.key.name);
                        }
                    }
                } else if (node.expression.right.type === 'Identifier') {
                    exports.push(node.expression.right.name);
                }
            }
        }
        
        return exports;
    }

    extractDependencies(ast) {
        const deps = new Set();
        
        const traverse = (node) => {
            if (node.type === 'CallExpression' && 
                node.callee?.name === 'require' &&
                node.arguments?.[0]?.type === 'StringLiteral') {
                
                const dep = node.arguments[0].value;
                if (!dep.startsWith('.')) {
                    deps.add(dep);
                }
            }
            
            for (const key in node) {
                if (typeof node[key] === 'object' && node[key] !== null) {
                    if (Array.isArray(node[key])) {
                        node[key].forEach(traverse);
                    } else {
                        traverse(node[key]);
                    }
                }
            }
        };
        
        ast.body.forEach(traverse);
        return Array.from(deps);
    }
}

module.exports = ASTParser;