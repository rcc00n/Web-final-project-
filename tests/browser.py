"""Service-free browser regressions; no external providers or form submissions."""
import contextlib
import functools
import http.server
import threading
import unittest
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

class CalculatorBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=ROOT))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.origin = f'http://127.0.0.1:{cls.server.server_port}'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    @contextlib.contextmanager
    def page(self, width=1440, reduced_motion='no-preference'):
        context = self.browser.new_context(viewport={'width': width, 'height': 900}, is_mobile=width < 600, has_touch=width < 600, reduced_motion=reduced_motion)
        unexpected, errors = [], []
        def restrict(route):
            request = route.request
            if request.method != 'GET':
                unexpected.append(request.method + ' ' + request.url)
                route.abort()
            elif request.url.startswith(self.origin + '/'):
                route.continue_()
            else:
                unexpected.append(request.url)
                route.abort()
        context.route('**/*', restrict)
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        try:
            yield page
            self.assertEqual(unexpected, [])
            self.assertEqual(errors, [])
        finally:
            context.close()

    def assert_no_overflow(self, page):
        self.assertLessEqual(page.evaluate('document.documentElement.scrollWidth'), page.viewport_size['width'])

    def test_desktop_mobile_expression_history_and_layout(self):
        for width in (1440, 390, 320):
            with self.subTest(width=width), self.page(width) as page:
                responses = []
                page.on('response', lambda response: responses.append(response.status))
                page.goto(self.origin)
                self.assertTrue(page.get_by_role('heading', name='Numpad').is_visible())
                self.assertEqual(page.locator('img[src="Prototypes/logo2.png"]').count(), 0)
                for expression, expected in [('2+3*4', '2+3*4=14'), ('cos(0)', 'cos(0)=1')]:
                    page.get_by_role('textbox', name='Mathematical expression').fill(expression)
                    calculate = page.get_by_role('button', name='Calculate expression')
                    calculate.tap() if width < 600 else calculate.click()
                    self.assertEqual(page.locator('#SolutionBox').inner_text(), expected)
                self.assertEqual(page.locator('#HistoryList li').count(), 2)
                page.get_by_role('button', name='Clear History').click()
                self.assertEqual(page.locator('#HistoryList li').count(), 0)
                self.assert_no_overflow(page)
                self.assertFalse(any(status >= 400 for status in responses))

    def test_unavailable_video_never_blocks_pointer_calculation(self):
        with self.page(390) as page:
            page.route('**/Start_screen.mp4', lambda route: route.abort())
            page.goto(self.origin)
            page.get_by_role('textbox', name='Mathematical expression').fill('6/3')
            page.get_by_role('button', name='Calculate expression').tap()
            self.assertEqual(page.locator('#SolutionBox').inner_text(), '6/3=2')
            self.assertFalse(page.locator('#introVideo').is_visible())
            self.assert_no_overflow(page)

    def test_active_intro_does_not_consume_pointer_or_escape(self):
        with self.page() as page:
            page.goto(self.origin)
            page.locator('#introVideo').dispatch_event('playing')
            self.assertTrue(page.get_by_role('button', name='Skip intro').is_visible())
            self.assertEqual(page.locator('#introVideo').evaluate('(v)=>getComputedStyle(v).pointerEvents'), 'none')
            page.get_by_role('textbox', name='Mathematical expression').fill('8/2')
            page.get_by_role('button', name='Calculate expression').click()
            self.assertEqual(page.locator('#SolutionBox').inner_text(), '8/2=4')
            self.assertFalse(page.locator('#introVideo').is_visible())
            page.reload()
            page.locator('#introVideo').dispatch_event('playing')
            page.keyboard.press('Escape')
            self.assertFalse(page.locator('#introVideo').is_visible())

    def test_skip_restores_focus_and_watchdog_bounds_intro(self):
        with self.page() as page:
            page.goto(self.origin)
            page.locator('#introVideo').dispatch_event('playing')
            page.get_by_role('button', name='Skip intro').focus()
            page.keyboard.press('Enter')
            self.assertTrue(page.locator('#display').evaluate('(e)=>e===document.activeElement'))
            self.assertFalse(page.locator('#skipIntro').is_visible())
            page.reload()
            page.locator('#introVideo').dispatch_event('playing')
            page.locator('#introVideo').dispatch_event('stalled')
            page.wait_for_function('document.getElementById("introVideo").hidden', timeout=7500)
            self.assertFalse(page.locator('#skipIntro').is_visible())

    def test_reduced_motion_and_missing_intro_script(self):
        with self.page(390, reduced_motion='reduce') as page:
            page.goto(self.origin)
            self.assertFalse(page.locator('#introVideo').is_visible())
            self.assertTrue(page.locator('#introVideo').evaluate('(v)=>v.paused'))
        with self.page(390) as page:
            page.route('**/intro.js', lambda route: route.abort())
            page.goto(self.origin)
            self.assertFalse(page.locator('#introVideo').is_visible())
            page.get_by_role('textbox', name='Mathematical expression').fill('5-2')
            page.get_by_role('button', name='Calculate expression').click()
            self.assertEqual(page.locator('#SolutionBox').inner_text(), '5-2=3')

if __name__ == '__main__':
    unittest.main(verbosity=2)
