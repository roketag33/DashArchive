import { prisma } from '../db'
import { Rule, RuleType, FileCategory } from '../../shared/types'
import { Rule as DbRule } from '@prisma/client'

export class RuleRepository {
  async getAll(): Promise<Rule[]> {
    const dbRules = await prisma.rule.findMany({
      orderBy: { priority: 'desc' }
    })

    return dbRules.map(this.mapToRule)
  }

  async save(rule: Rule): Promise<Rule> {
    const data = this.mapToData(rule)

    const saved = await prisma.rule.upsert({
      where: { id: rule.id },
      create: data,
      update: data
    })

    return this.mapToRule(saved)
  }

  async saveAll(rules: Rule[]): Promise<void> {
    // Transactional save not strictly necessary but good for consistency
    // Simple approach: Upsert one by one. Bulk upsert is not natively supported in same way for SQLite helper yet (createMany is create only).
    // so we loop.
    await prisma.$transaction(
      rules.map((rule) => {
        const data = this.mapToData(rule)
        return prisma.rule.upsert({
          where: { id: rule.id },
          create: data,
          update: data
        })
      })
    )
  }

  async delete(id: string): Promise<void> {
    await prisma.rule.delete({ where: { id } }).catch(() => {
      // Ignore if not found
    })
  }

  // --- Mappers ---

  private mapToRule(dbRule: DbRule): Rule {
    return {
      id: dbRule.id,
      name: dbRule.name,
      type: dbRule.type as RuleType,
      isActive: dbRule.isActive,
      priority: dbRule.priority,
      destination: dbRule.destination,
      description: dbRule.description || undefined,
      extensions: dbRule.extensions ? JSON.parse(dbRule.extensions) : [],
      namePattern: dbRule.namePattern || undefined,
      sizeMin: dbRule.sizeMin ? Number(dbRule.sizeMin) : undefined,
      sizeMax: dbRule.sizeMax ? Number(dbRule.sizeMax) : undefined,
      categories: dbRule.categories ? (JSON.parse(dbRule.categories) as FileCategory[]) : undefined,
      ageDays: dbRule.ageDays || undefined,
      aiPrompts: dbRule.aiPrompts ? JSON.parse(dbRule.aiPrompts) : undefined
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToData(rule: Rule): any {
    return {
      id: rule.id,
      name: rule.name || 'Unnamed Rule',
      type: rule.type,
      isActive: rule.isActive,
      priority: rule.priority,
      destination: rule.destination,
      description: rule.description,
      extensions: rule.extensions ? JSON.stringify(rule.extensions) : null,
      namePattern: rule.namePattern,
      sizeMin: rule.sizeMin ? BigInt(Math.floor(rule.sizeMin)) : null,
      sizeMax: rule.sizeMax ? BigInt(Math.floor(rule.sizeMax)) : null,
      categories: rule.categories ? JSON.stringify(rule.categories) : null,
      ageDays: rule.ageDays,
      aiPrompts: rule.aiPrompts ? JSON.stringify(rule.aiPrompts) : null
    }
  }
}

export const ruleRepository = new RuleRepository()
