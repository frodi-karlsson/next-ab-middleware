import { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event' // fix for: "NextFetchEvent" is not a constructor
import { NextRequest, type NextResponse } from 'next/server'
import { describe, expect, test, vi } from 'vitest'
import { createABAssignmentMiddleware } from './ab-middleware'

describe('createABAssignmentMiddleware', () => {
	test('should return value from cookie if it exists', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.1) // Should give 0 as variant to unassigned request
		const mockedRequest = mockRequest({
			cookies: { 'ab-middleware': '{"my-test":"1"}' }
		})
		const middleware = createABAssignmentMiddleware({
			id: 'my-test',
			cookieName: 'ab-middleware',
			numberOfVariants: 2
		})
		const mockEvent = mockFetchEvent(mockedRequest)

		const response = (await middleware(
			mockedRequest,
			mockEvent
		)) as NextResponse<unknown>

		expect(response.headers.get('x-ab-my-test')).toBe('1')
		expect(response.cookies.get('ab-middleware')?.value).toBe('{"my-test":"1"}')
	})

	test('should have number of variants as max value', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.9999)
		const middleware = createABAssignmentMiddleware({
			id: 'my-test',
			numberOfVariants: 5
		})
		const mockedRequest = mockRequest({})
		const mockEvent = mockFetchEvent(mockedRequest)

		const response = (await middleware(
			mockedRequest,
			mockEvent
		)) as NextResponse<unknown>

		expect(response.headers.get('x-ab-my-test')).toBe('4') // 0-indexed
		expect(response.cookies.get('ab-middleware')?.value).toBe('{"my-test":"4"}')
	})

	test('should set cookie with correct options', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.1) // Should give 0 as variant to unassigned request
		const mockedRequest = mockRequest({})
		const middleware = createABAssignmentMiddleware({
			id: 'my-test',
			cookieName: 'ab-middleware',
			cookieOptions: { httpOnly: true, secure: true },
			numberOfVariants: 2
		})
		const mockEvent = mockFetchEvent(mockedRequest)

		const response = (await middleware(
			mockedRequest,
			mockEvent
		)) as NextResponse<unknown>

		expect(response.headers.get('x-ab-my-test')).toBe('0')
		expect(response.cookies.get('ab-middleware')?.value).toBe('{"my-test":"0"}')
		expect(response.cookies.get('ab-middleware')?.httpOnly).toBe(true)
		expect(response.cookies.get('ab-middleware')?.secure).toBe(true)
	})
})

function mockRequest({
	headers = {},
	cookies = {},
	url = 'http://localhost:3000'
}: {
	headers?: Record<string, string>
	cookies?: Record<string, string>
	url?: string
}): NextRequest {
	const request = new NextRequest(url, {
		headers: new Headers(headers),
		method: 'GET'
	})

	// Mock cookies
	Object.entries(cookies).forEach(([name, value]) => {
		request.cookies.set(name, value)
	})

	return request
}

function mockFetchEvent(request: NextRequest): NextFetchEvent {
	return new NextFetchEvent({
		request,
		page: '/',
		context: { waitUntil: () => Promise.resolve() }
	})
}
