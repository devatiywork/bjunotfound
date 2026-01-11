import type { ProductUserResponse } from '../../../../../../../api/types/products'

interface GlobalProductSectionProps {
	product: ProductUserResponse
}

export const GlobalProductSection = ({
	product,
}: GlobalProductSectionProps) => {
	if (!product.productGlobal) {
		return null
	}

	return (
		<section>
			<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3'>
				Глобальный продукт
			</h3>
			<div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4'>
				<p className='text-sm text-blue-600 dark:text-blue-400 mb-2'>
					Этот продукт связан с глобальной базой данных
				</p>
				<p className='text-xs text-gray-600 dark:text-gray-400'>
					ID: {product.productGlobal.id}
				</p>
				{product.productGlobal.barcode && (
					<p className='text-xs text-gray-600 dark:text-gray-400'>
						Штрих-код: {product.productGlobal.barcode}
					</p>
				)}
			</div>
		</section>
	)
}
