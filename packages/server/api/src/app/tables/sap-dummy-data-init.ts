import { databaseConnection } from '../database/database-connection'
import { TableEntity } from './table/table.entity'
import { FieldEntity } from './field/field.entity'
import { RecordEntity } from './record/record.entity'
import { CellEntity } from './record/cell.entity'
import { nanoid } from 'nanoid'
import { FieldType, TableAutomationStatus } from '@activepieces/shared'

interface SAPTableConfig {
    name: string
    externalId: string
    fields: {
        name: string
        type: FieldType
        externalId: string
    }[]
}

interface SAPRecord {
    [key: string]: any
}

export class SAPDummyDataInitializer {
    private projectId: string

    constructor(projectId: string) {
        this.projectId = projectId
    }

    // SAP Table Configurations
    private readonly tableConfigs: SAPTableConfig[] = [
        {
            name: 'SAP Stok Durumu',
            externalId: 'sap_stok',
            fields: [
                { name: 'malzeme_kodu', externalId: 'malzeme_kodu', type: FieldType.TEXT },
                { name: 'malzeme_adi', externalId: 'malzeme_adi', type: FieldType.TEXT },
                { name: 'miktar', externalId: 'miktar', type: FieldType.NUMBER },
                { name: 'birim', externalId: 'birim', type: FieldType.TEXT },
                { name: 'depo', externalId: 'depo', type: FieldType.TEXT },
                { name: 'minimum_stok', externalId: 'minimum_stok', type: FieldType.NUMBER },
            ]
        },
        {
            name: 'SAP Müşteri Bakiye',
            externalId: 'sap_musteri_bakiye',
            fields: [
                { name: 'musteri_kodu', externalId: 'musteri_kodu', type: FieldType.TEXT },
                { name: 'musteri_adi', externalId: 'musteri_adi', type: FieldType.TEXT },
                { name: 'borc', externalId: 'borc', type: FieldType.NUMBER },
                { name: 'alacak', externalId: 'alacak', type: FieldType.NUMBER },
                { name: 'bakiye', externalId: 'bakiye', type: FieldType.NUMBER },
                { name: 'son_islem_tarihi', externalId: 'son_islem_tarihi', type: FieldType.DATE },
            ]
        },
        {
            name: 'SAP Satış Siparişleri',
            externalId: 'sap_satis_siparisleri',
            fields: [
                { name: 'siparis_no', externalId: 'siparis_no', type: FieldType.TEXT },
                { name: 'musteri_kodu', externalId: 'musteri_kodu', type: FieldType.TEXT },
                { name: 'musteri_adi', externalId: 'musteri_adi', type: FieldType.TEXT },
                { name: 'siparis_tarihi', externalId: 'siparis_tarihi', type: FieldType.DATE },
                { name: 'teslim_tarihi', externalId: 'teslim_tarihi', type: FieldType.DATE },
                { name: 'toplam_tutar', externalId: 'toplam_tutar', type: FieldType.NUMBER },
                { name: 'durum', externalId: 'durum', type: FieldType.TEXT },
            ]
        }
    ]

    // Sample Data
    private readonly sampleData: { [tableName: string]: SAPRecord[] } = {
        'sap_stok': [
            { malzeme_kodu: 'MAL001', malzeme_adi: 'Çimento 42.5R', miktar: 1500, birim: 'TON', depo: 'DEPO-01', minimum_stok: 500 },
            { malzeme_kodu: 'MAL002', malzeme_adi: 'Demir Φ12', miktar: 250, birim: 'TON', depo: 'DEPO-01', minimum_stok: 100 },
            { malzeme_kodu: 'MAL003', malzeme_adi: 'Kum', miktar: 3000, birim: 'M3', depo: 'DEPO-02', minimum_stok: 1000 },
            { malzeme_kodu: 'MAL004', malzeme_adi: 'Çakıl', miktar: 2500, birim: 'M3', depo: 'DEPO-02', minimum_stok: 800 },
            { malzeme_kodu: 'MAL005', malzeme_adi: 'Tuğla', miktar: 50000, birim: 'ADET', depo: 'DEPO-03', minimum_stok: 10000 },
            { malzeme_kodu: 'MAL006', malzeme_adi: 'Alçı', miktar: 120, birim: 'TON', depo: 'DEPO-01', minimum_stok: 50 },
            { malzeme_kodu: 'MAL007', malzeme_adi: 'Boya', miktar: 800, birim: 'LT', depo: 'DEPO-04', minimum_stok: 200 },
            { malzeme_kodu: 'MAL008', malzeme_adi: 'Seramik', miktar: 5000, birim: 'M2', depo: 'DEPO-03', minimum_stok: 1500 },
        ],
        'sap_musteri_bakiye': [
            { musteri_kodu: 'MUS001', musteri_adi: 'ABC İnşaat A.Ş.', borc: 150000, alacak: 75000, bakiye: -75000, son_islem_tarihi: new Date('2024-01-15') },
            { musteri_kodu: 'MUS002', musteri_adi: 'XYZ Yapı Ltd.', borc: 85000, alacak: 120000, bakiye: 35000, son_islem_tarihi: new Date('2024-01-20') },
            { musteri_kodu: 'MUS003', musteri_adi: 'Mega İnşaat', borc: 320000, alacak: 280000, bakiye: -40000, son_islem_tarihi: new Date('2024-01-18') },
            { musteri_kodu: 'MUS004', musteri_adi: 'Güven Yapı', borc: 45000, alacak: 45000, bakiye: 0, son_islem_tarihi: new Date('2024-01-22') },
            { musteri_kodu: 'MUS005', musteri_adi: 'Star İnşaat', borc: 200000, alacak: 150000, bakiye: -50000, son_islem_tarihi: new Date('2024-01-25') },
            { musteri_kodu: 'MUS006', musteri_adi: 'Doğa Yapı', borc: 60000, alacak: 90000, bakiye: 30000, son_islem_tarihi: new Date('2024-01-23') },
        ],
        'sap_satis_siparisleri': [
            { siparis_no: 'SIP001', musteri_kodu: 'MUS001', musteri_adi: 'ABC İnşaat A.Ş.', siparis_tarihi: new Date('2024-01-10'), teslim_tarihi: new Date('2024-01-25'), toplam_tutar: 75000, durum: 'Teslim Edildi' },
            { siparis_no: 'SIP002', musteri_kodu: 'MUS002', musteri_adi: 'XYZ Yapı Ltd.', siparis_tarihi: new Date('2024-01-12'), teslim_tarihi: new Date('2024-01-28'), toplam_tutar: 120000, durum: 'Hazırlanıyor' },
            { siparis_no: 'SIP003', musteri_kodu: 'MUS003', musteri_adi: 'Mega İnşaat', siparis_tarihi: new Date('2024-01-15'), teslim_tarihi: new Date('2024-02-01'), toplam_tutar: 280000, durum: 'Onay Bekliyor' },
            { siparis_no: 'SIP004', musteri_kodu: 'MUS001', musteri_adi: 'ABC İnşaat A.Ş.', siparis_tarihi: new Date('2024-01-18'), teslim_tarihi: new Date('2024-02-05'), toplam_tutar: 95000, durum: 'Üretimde' },
            { siparis_no: 'SIP005', musteri_kodu: 'MUS004', musteri_adi: 'Güven Yapı', siparis_tarihi: new Date('2024-01-20'), teslim_tarihi: new Date('2024-02-10'), toplam_tutar: 45000, durum: 'Hazırlanıyor' },
            { siparis_no: 'SIP006', musteri_kodu: 'MUS005', musteri_adi: 'Star İnşaat', siparis_tarihi: new Date('2024-01-22'), teslim_tarihi: new Date('2024-02-08'), toplam_tutar: 150000, durum: 'Onaylandı' },
            { siparis_no: 'SIP007', musteri_kodu: 'MUS006', musteri_adi: 'Doğa Yapı', siparis_tarihi: new Date('2024-01-24'), teslim_tarihi: new Date('2024-02-12'), toplam_tutar: 90000, durum: 'Hazırlanıyor' },
            { siparis_no: 'SIP008', musteri_kodu: 'MUS002', musteri_adi: 'XYZ Yapı Ltd.', siparis_tarihi: new Date('2024-01-25'), teslim_tarihi: new Date('2024-02-15'), toplam_tutar: 65000, durum: 'Yeni' },
        ]
    }

    async initializeSAPTables(): Promise<void> {
        const connection = databaseConnection()

        console.log('🚀 Starting SAP dummy data initialization...')

        for (const config of this.tableConfigs) {
            try {
                // Check if table already exists
                const existingTable = await connection.getRepository(TableEntity).findOne({
                    where: {
                        projectId: this.projectId,
                        externalId: config.externalId
                    }
                })

                if (existingTable) {
                    console.log(`⚠️ Table ${config.name} already exists, skipping...`)
                    continue
                }

                // Create table
                const tableId = nanoid()
                const table = await connection.getRepository(TableEntity).save({
                    id: tableId,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                    name: config.name,
                    externalId: config.externalId,
                    projectId: this.projectId,
                    status: TableAutomationStatus.ENABLED,
                })

                console.log(`✅ Created table: ${config.name}`)

                // Create fields
                const fieldIds: { [name: string]: string } = {}
                for (let i = 0; i < config.fields.length; i++) {
                    const fieldConfig = config.fields[i]
                    const fieldId = nanoid()
                    fieldIds[fieldConfig.name] = fieldId

                    await connection.getRepository(FieldEntity).save({
                        id: fieldId,
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                        tableId: tableId,
                        projectId: this.projectId,
                        name: fieldConfig.name,
                        externalId: fieldConfig.externalId,
                        type: fieldConfig.type,
                    })
                }

                console.log(`  📋 Created ${config.fields.length} fields`)

                // Insert sample data
                const records = this.sampleData[config.externalId] || []
                for (const recordData of records) {
                    const recordId = nanoid()

                    // Create record
                    await connection.getRepository(RecordEntity).save({
                        id: recordId,
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                        tableId: tableId,
                    })

                    // Create cells for each field
                    for (const [fieldName, value] of Object.entries(recordData)) {
                        const fieldId = fieldIds[fieldName]
                        if (fieldId) {
                            await connection.getRepository(CellEntity).save({
                                id: nanoid(),
                                created: new Date().toISOString(),
                                updated: new Date().toISOString(),
                                recordId: recordId,
                                fieldId: fieldId,
                                value: value instanceof Date ? value.toISOString() : String(value),
                            })
                        }
                    }
                }

                console.log(`  📊 Inserted ${records.length} sample records`)

            } catch (error) {
                console.error(`❌ Error creating table ${config.name}:`, error)
            }
        }

        console.log('✨ SAP dummy data initialization completed!')
    }

    async cleanupSAPTables(): Promise<void> {
        const connection = databaseConnection()

        console.log('🗑️ Cleaning up SAP tables...')

        for (const config of this.tableConfigs) {
            try {
                const table = await connection.getRepository(TableEntity).findOne({
                    where: {
                        projectId: this.projectId,
                        externalId: config.externalId
                    }
                })

                if (table) {
                    await connection.getRepository(TableEntity).remove(table)
                    console.log(`✅ Removed table: ${config.name}`)
                }
            } catch (error) {
                console.error(`❌ Error removing table ${config.name}:`, error)
            }
        }
    }
}

// Export a function to run initialization
export async function initializeSAPDummyData(projectId: string): Promise<void> {
    const initializer = new SAPDummyDataInitializer(projectId)
    await initializer.initializeSAPTables()
}

// Export a function to cleanup
export async function cleanupSAPDummyData(projectId: string): Promise<void> {
    const initializer = new SAPDummyDataInitializer(projectId)
    await initializer.cleanupSAPTables()
}